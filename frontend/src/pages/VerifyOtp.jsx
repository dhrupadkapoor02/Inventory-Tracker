import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import * as authApi from '../api/auth.api';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'EMAIL_VERIFICATION';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return (
      <AuthLayout title="Missing email" subtitle="Please restart the process">
        <Link to="/register" className="text-sm font-medium text-brand-600 hover:underline">
          Back to register
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (purpose === 'EMAIL_VERIFICATION') {
        await authApi.verifyOtp({ email, code, purpose });
        toast.success('Email verified. You can log in now.');
        navigate('/login');
      } else {
        // PASSWORD_RESET purpose - forward to the reset password page with the code
        navigate('/reset-password', { state: { email, code } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp({ email, purpose });
      toast.success('A new OTP has been sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="Verification code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          maxLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <button
        onClick={handleResend}
        disabled={resending}
        className="mt-4 w-full text-center text-sm font-medium text-brand-600 hover:underline disabled:opacity-60"
      >
        {resending ? 'Resending...' : "Didn't get a code? Resend"}
      </button>
    </AuthLayout>
  );
}
