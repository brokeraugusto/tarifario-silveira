import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          throw error;
        }
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) {
          throw error;
        }
        toast.success('Conta criada com sucesso! Você já pode fazer login.');
        setMode('login');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      toast.error(error.message || 'Erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };
  return <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img alt="Silveira Eco Village Logo" className="h-16 w-auto" src="/lovable-uploads/ab881029-adcb-4085-8c02-0720c4a2a096.png" />
          </div>
          <CardTitle className="text-2xl">Tarifário Silveira Eco Village</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Faça login para acessar o sistema' : 'Crie sua conta para acessar o sistema'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processando...' : mode === 'login' ? <><LogIn className="mr-2 h-4 w-4" /> Entrar</> : 'Criar Conta'}
            </Button>
            <Button type="button" variant="link" className="w-full" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} disabled={loading}>
              {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
export default AuthPage;