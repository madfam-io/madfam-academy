import React, { useState } from 'react';
import { X, CreditCard, Award, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PricingDisplay } from '../pricing/PricingDisplay';
import { cn } from '../../lib/utils';

interface EnrollmentFlowProps {
  course: {
    id: string;
    title: string;
    pricing: any;
    conocerCertified: boolean;
    durationHours: number;
  };
  onClose: () => void;
}

interface EnrollmentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export const EnrollmentFlow: React.FC<EnrollmentFlowProps> = ({
  course,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    requestConocerCert: course.conocerCertified,
    paymentMethod: '',
    agreedToTerms: false,
    solarpunkCommitment: false
  });

  const steps: EnrollmentStep[] = [
    {
      id: 'options',
      title: 'Enrollment Options',
      description: 'Choose your learning path and certification preferences',
      completed: currentStep > 0,
      current: currentStep === 0
    },
    {
      id: 'payment',
      title: 'Payment Information',
      description: 'Complete your payment to secure your enrollment',
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and confirm your enrollment details',
      completed: currentStep > 2,
      current: currentStep === 2
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEnrollment = async () => {
    setIsLoading(true);
    try {
      // Simulate enrollment API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle successful enrollment
      onClose();
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} size="large">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Enroll in Course
            </h2>
            <p className="text-gray-600 mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    step.completed
                      ? 'bg-green-600 text-white'
                      : step.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      'text-sm font-medium',
                      step.current ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'mx-8 w-16 h-0.5',
                    step.completed ? 'bg-green-600' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 0 && (
            <EnrollmentOptions
              course={course}
              data={enrollmentData}
              onChange={setEnrollmentData}
            />
          )}
          
          {currentStep === 1 && (
            <PaymentStep
              course={course}
              data={enrollmentData}
              onChange={setEnrollmentData}
            />
          )}
          
          {currentStep === 2 && (
            <ConfirmationStep
              course={course}
              data={enrollmentData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleEnrollment}
                disabled={isLoading || !enrollmentData.agreedToTerms}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Complete Enrollment'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const EnrollmentOptions: React.FC<{
  course: any;
  data: any;
  onChange: (data: any) => void;
}> = ({ course, data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Learning Path</h3>
        
        {/* Course Pricing */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <PricingDisplay pricing={course.pricing} detailed />
        </div>

        {/* CONOCER Certification Option */}
        {course.conocerCertified && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="conocer-cert"
                  checked={data.requestConocerCert}
                  onChange={(e) => onChange({
                    ...data,
                    requestConocerCert: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="conocer-cert" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                  <Award className="w-5 h-5 text-blue-600" />
                  Request CONOCER Official Certification
                </label>
                <p className="text-sm text-gray-600 mt-2">
                  Get official recognition from Mexico's National Council for Standardization 
                  and Certification of Labor Competency. This certification is recognized 
                  by employers and institutions across Mexico.
                </p>
                <div className="mt-3 text-sm">
                  <div className="text-gray-700">
                    <strong>Benefits:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Official government recognition</li>
                      <li>Enhanced career opportunities</li>
                      <li>Skills validation for employers</li>
                      <li>Path to advanced certifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solarpunk Commitment */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                id="solarpunk-commitment"
                checked={data.solarpunkCommitment}
                onChange={(e) => onChange({
                  ...data,
                  solarpunkCommitment: e.target.checked
                })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="solarpunk-commitment" className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                <Shield className="w-5 h-5 text-green-600" />
                Solarpunk Impact Commitment
              </label>
              <p className="text-sm text-gray-600 mt-2">
                I commit to applying the knowledge from this course to create positive 
                environmental and social impact in my community. This includes sharing 
                learnings, implementing sustainable practices, and contributing to 
                regenerative projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentStep: React.FC<{
  course: any;
  data: any;
  onChange: (data: any) => void;
}> = ({ course, data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Information</h3>
      
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Course: {course.title}</span>
            <span>${course.pricing.amount}</span>
          </div>
          {data.requestConocerCert && (
            <div className="flex justify-between">
              <span>CONOCER Certification Processing</span>
              <span>$25.00</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${course.pricing.amount + (data.requestConocerCert ? 25 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h4 className="font-medium mb-4">Payment Method</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="credit-card"
              checked={data.paymentMethod === 'credit-card'}
              onChange={(e) => onChange({
                ...data,
                paymentMethod: e.target.value
              })}
              className="text-blue-600"
            />
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span>Credit/Debit Card</span>
          </label>
          
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={data.paymentMethod === 'paypal'}
              onChange={(e) => onChange({
                ...data,
                paymentMethod: e.target.value
              })}
              className="text-blue-600"
            />
            <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
              P
            </div>
            <span>PayPal</span>
          </label>
        </div>
      </div>

      {/* Card Details (if credit card selected) */}
      {data.paymentMethod === 'credit-card' && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConfirmationStep: React.FC<{
  course: any;
  data: any;
}> = ({ course, data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Confirm Your Enrollment</h3>
      
      {/* Enrollment Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium mb-4">Enrollment Summary</h4>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-600">Course</span>
            <p className="font-medium">{course.title}</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Duration</span>
            <p className="font-medium">{course.durationHours} hours</p>
          </div>
          
          {data.requestConocerCert && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm">CONOCER Certification Requested</span>
            </div>
          )}
          
          {data.solarpunkCommitment && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm">Solarpunk Impact Commitment Made</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={data.agreedToTerms}
            onChange={(e) => {
              // This would be handled by parent component
            }}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
              I agree to the Terms of Service and Privacy Policy
            </label>
            <p className="text-xs text-gray-600 mt-1">
              By enrolling, you agree to our terms of service, privacy policy, and 
              community guidelines. You also acknowledge that course content is for 
              educational purposes and commit to using knowledge responsibly.
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Important Information
            </h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• You'll receive immediate access to all course materials</li>
              <li>• CONOCER certification processing takes 2-4 weeks</li>
              <li>• All sales are final, but we offer a 30-day satisfaction guarantee</li>
              <li>• Course completion certificate is issued automatically upon finishing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};