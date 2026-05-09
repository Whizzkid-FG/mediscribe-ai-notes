import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialization: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!agreedToTerms) newErrors.terms = 'You must agree to terms';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response?.data?.code === 'EMAIL_EXISTS') {
        setErrors({ email: 'This email is already registered' });
      } else if (err.response?.data?.code === 'VALIDATION_ERROR') {
        // Handle validation errors from backend
        const validationErrors = {};
        err.response.data.errors?.forEach((err) => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to create account. Please try again.',
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">MedScribe</h1>
          </div>
          <p className="text-slate-600">Create Your Professional Account</p>
        </div>

        {/* Signup Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>Join healthcare professionals using MedScribe for efficient documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Alert */}
              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Submit Error Alert */}
              {errors.submit && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2">{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`h-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`h-10 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Professional Information</h3>
                
                {/* License Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">License Number</label>
                  <Input
                    type="text"
                    name="licenseNumber"
                    placeholder="MD123456"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`h-10 ${errors.licenseNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-600">{errors.licenseNumber}</p>
                  )}
                  <p className="text-xs text-slate-500">Your medical license number for verification</p>
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm ${
                      errors.specialization ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select specialization...</option>
                    <option value="general">General Practice</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.specialization && (
                    <p className="text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                {/* Practice Name (Optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Practice/Hospital (Optional)</label>
                  <Input
                    type="text"
                    name="practice"
                    placeholder="Your practice name"
                    value={formData.practice}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Security</h3>
                
                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`h-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="text-xs text-slate-500">Minimum 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`h-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                  disabled={isLoading}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-teal-600 hover:underline font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-teal-600 hover:underline font-medium">
                    Privacy Policy
                  </a>
                  . I also acknowledge HIPAA compliance requirements.
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              {/* Signup Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <span className="text-slate-600">Already have an account? </span>
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign In
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
              <p className="text-red-600 font-medium">⚕️ HIPAA Compliant Platform</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
