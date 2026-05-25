import dynamic from 'next/dynamic';

const AdminExportContent = dynamic(() => import('./AdminExportContent'), { ssr: false });

export default function AdminExportPage() {
  return <AdminExportContent />;
}
