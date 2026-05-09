import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Stethoscope, ArrowLeft, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(true);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);

    try {
      // Password reset feature is coming soon
      setSuccessMessage('Password reset instructions have been sent to your email');
      setShowComingSoon(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to process password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">MedScribe</h1>
          </div>
          <p className="text-slate-600">Real-time Medical Transcription</p>
        </div>

        {/* Password Reset Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Recover access to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Coming Soon Alert */}
              <Alert className="bg-amber-50 border-amber-200">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 ml-2">
                  <strong>Feature Coming Soon</strong> — Password reset functionality will be available shortly. Please contact support@medscribe.com for immediate assistance.
                </AlertDescription>
              </Alert>

              {/* Information */}
              <div className="space-y-3 py-4">
                <p className="text-sm text-slate-700">
                  To reset your password, our support team is here to help. Please reach out with your registered email address.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-blue-900">📧 Contact Support:</p>
                  <a
                    href="mailto:support@medscribe.com"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    support@medscribe.com
                  </a>
                </div>
              </div>

              {/* Back to Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                For security issues, contact{' '}
                <a href="mailto:security@medscribe.com" className="text-teal-600 hover:underline">
                  security@medscribe.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>🔒 Security:</strong> Your account is protected with HIPAA-compliant encryption. Never share your password with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
