
import { useState, useEffect } from 'react';
import { data } from 'react-router';
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/core/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
// import { useToast } from '@/components/ui/use-toast';
// import { createClient } from '@/utils/supabase/client';

// Mock 데이터 타입
interface Phrase {
  id: number;
  phrase: string;
  scene: string;
}



export default function MyPhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const { toast } = useToast();

  useEffect(() => {
    // const fetchPhrases = async () => {
    //   const supabase = createClient();
    //   const {
    //     data: { user },
    //   } = await supabase.auth.getUser();

    //   if (user) {
    //     const { data, error } = await supabase
    //       .from('phrases')
    //       .select('*')
    //       .eq('user_id', user.id)
    //       .order('created_at', { ascending: false });

    //     if (error) {
    //       console.error('Error fetching phrases:', error);
    //       toast({ title: '오류', description: '데이터를 불러오는 데 실패했습니다.', variant: 'destructive' });
    //     } else {
    //       setPhrases(data || []);
    //     }
    //   }
    //   setLoading(false);
    // };

    // fetchPhrases();

    // 임시 Mock 데이터
    const mockData: Phrase[] = [
      { id: 1, phrase: '첫 번째로 저장된 표현입니다. 아주 재치있죠?', scene: '동료와의 어색한 첫 만남' },
      { id: 2, phrase: '이 회의, 제가 아이스브레이킹 해보겠습니다!', scene: '지루한 팀 회의' },
    ];
    setTimeout(() => {
      setPhrases(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // toast({ description: '✅ 클립보드에 복사되었습니다.' });
    alert('클립보드에 복사되었습니다.');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">내 표현 목록</h1>
      
      {phrases.length === 0 ? (
        <div className="text-center py-20">
          <p className="mb-4">저장된 표현이 없습니다.</p>
          <Button onClick={() => navigate('/create-scene')}>표현 만들러 가기</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {phrases.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.phrase}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">상황: {p.scene}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">...</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>X(트위터)로 공유</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopy(p.phrase)}>텍스트 복사</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">삭제하기</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
