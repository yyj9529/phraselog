import { useSearchParams, useNavigate } from "react-router";
import { data } from "react-router";
import { Button } from '~/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/core/components/ui/card';
// import { useToast } from '@/components/ui/use-toast';
// import { createClient } from '@/utils/supabase/client';


export default function AiResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const { toast } = useToast();
  // const supabase = createClient();

  const scene = searchParams.get('scene') || '내용 없음';
  const phrase = searchParams.get('phrase') || '생성된 표현이 없습니다.';

  const handleSave = async () => {
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    // if (user) {
    //   const { error } = await supabase
    //     .from('phrases')
    //     .insert([{ user_id: user.id, scene, phrase }]);

    //   if (error) {
    //     toast({
    //       title: '오류',
    //       description: '저장에 실패했습니다: ' + error.message,
    //       variant: 'destructive',
    //     });
    //   } else {
    //     toast({
    //       title: '성공',
    //       description: '표현이 저장되었습니다.',
    //     });
    //     navigate('/my-phrases');
    //   }
    // } else {
    //   toast({
    //     title: '오류',
    //     description: '로그인이 필요합니다.',
    //     variant: 'destructive',
    //   });
    //   navigate('/login');
    // }
    console.log('Save clicked', { scene, phrase });
    alert('저장 기능은 곧 구현될 예정입니다.');
    navigate('/my-phrases');
  };

  const handleRetry = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI가 생성한 표현입니다</CardTitle>
          <CardDescription>아래 표현을 저장하거나 다시 만들어보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-2xl font-bold text-center p-4 bg-gray-100 rounded-md">
              {phrase}
            </p>
            <div>
              <span className="text-sm font-medium text-gray-500">입력한 상황:</span>
              <p className="text-gray-700">{scene}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleRetry}>
            다시 만들기
          </Button>
          <Button onClick={handleSave}>저장하기</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
