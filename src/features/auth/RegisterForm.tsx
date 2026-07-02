import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterFormValues } from './schemas';
import { useAuth } from '@/contexts/AuthProvider';
import { extractErrorMessage } from '@/api/axios';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate('/');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoFocus
          autoComplete="name"
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name')}
        />
      </FormField>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 6 characters">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" className="w-full mt-2" isLoading={submitting}>
        Create account
      </Button>
    </form>
  );
}
