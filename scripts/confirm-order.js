const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

async function generateSecureToken(len = 40) {
  return crypto.randomBytes(len).toString('base64url').slice(0, len);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/confirm-order.js <ORDER_NUMBER> [--admin=admin@example.com]');
    process.exit(1);
  }

  const orderNumber = args[0];
  const adminArg = args.find(a => a.startsWith('--admin=')) || '';
  const adminEmail = adminArg ? adminArg.split('=')[1] : 'admin';

  const prisma = new PrismaClient();
  try {
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) {
      console.error('Order not found:', orderNumber);
      process.exit(2);
    }

    const items = JSON.parse(order.items || '[]');
    const tokens = [];

    for (const item of items) {
      const productId = (item.product && item.product.id) || item.id || null;
      let product = null;

      if (productId) {
        product = await prisma.product.findUnique({ where: { id: productId } });
      }
      if (!product && item.name) {
        product = await prisma.product.findFirst({ where: { name: item.name } });
      }

      if (!product) {
        console.warn('Product not found for item:', item);
        continue;
      }

      if (!product.fileUrl) {
        console.warn('Product has no fileUrl:', product.name);
        continue;
      }

      const token = await generateSecureToken(40);
      tokens.push({
        token,
        productId: product.id,
        productName: product.name,
        fileUrl: product.fileUrl,
        fileName: product.fileUrl.split('/').pop() || product.name
      });
    }

    const updatedItems = items.map(it => {
      const match = tokens.find(t =>
        t.productName === (it.name || '') ||
        t.productId === (it.product && it.product.id) ||
        t.productId === it.id
      );
      if (match) {
        return {
          ...it,
          token: match.token,
          fileUrl: match.fileUrl,
          fileName: match.fileName
        };
      }
      return it;
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        verifiedAt: new Date(),
        verifiedBy: adminEmail,
        items: JSON.stringify(updatedItems),
      }
    });

    console.log('Order confirmed and tokens generated:', tokens.length);
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    for (const t of tokens) {
      console.log(`${siteUrl}/download/${t.token} -> ${t.fileUrl}`);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  }
}

main();
