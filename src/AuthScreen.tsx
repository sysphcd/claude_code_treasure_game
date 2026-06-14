import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { signIn, signUp } from './db';
import type { User } from './db';

interface AuthScreenProps {
  onAuth: (user: User) => void;
  onGuest: () => void;
}

interface FormValues {
  username: string;
  password: string;
}

function SignInForm({ onAuth }: { onAuth: (user: User) => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const user = await signIn(data.username, data.password);
      if (!user) {
        toast.error('Invalid username or password');
        return;
      }
      toast.success(`Welcome back, ${user.username}!`);
      onAuth(user);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="signin-username">Username</Label>
        <Input
          id="signin-username"
          placeholder="Enter username"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'At least 3 characters' },
          })}
        />
        {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
        {loading ? <Loader2 className="animate-spin size-4" /> : 'Sign In'}
      </Button>
    </form>
  );
}

function SignUpForm({ onAuth }: { onAuth: (user: User) => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const user = await signUp(data.username, data.password);
      toast.success(`Welcome, ${user.username}!`);
      onAuth(user);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        toast.error('Username already taken');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="signup-username">Username</Label>
        <Input
          id="signup-username"
          placeholder="Enter username"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'At least 3 characters' },
          })}
        />
        {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Enter password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
        {loading ? <Loader2 className="animate-spin size-4" /> : 'Sign Up'}
      </Button>
    </form>
  );
}

export default function AuthScreen({ onAuth, onGuest }: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-700 text-sm">💰 Treasure: +$100 | 💀 Skeleton: -$50</p>
      </div>

      <Tabs defaultValue="signin" className="w-full max-w-sm">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Sign in to track your scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm onAuth={onAuth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Create an account to save your scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignUpForm onAuth={onAuth} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3 my-6 w-full max-w-sm">
        <div className="flex-1 h-px bg-amber-300" />
        <span className="text-amber-600 text-sm">or</span>
        <div className="flex-1 h-px bg-amber-300" />
      </div>

      <Button
        variant="outline"
        className="w-full max-w-sm border-amber-400 text-amber-800 hover:bg-amber-100"
        onClick={onGuest}
      >
        Play as Guest
      </Button>
    </div>
  );
}
