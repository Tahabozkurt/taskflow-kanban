import BoardView from '@/components/BoardView';

export default async function BoardPage({ 
  params 
}: { 
  params: Promise<{ boardId: string }> 
}) {
  // Next.js'in yeni sürümü gereği params'ı await ile çözüyoruz
  const resolvedParams = await params;
  
  return <BoardView boardId={resolvedParams.boardId} />;
}