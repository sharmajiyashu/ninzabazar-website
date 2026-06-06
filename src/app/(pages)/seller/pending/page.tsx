'use client'
import React from 'react'
import BackgroundDesign from './background'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Clock, Mail, FileText } from 'lucide-react'

const StorePendingApproval = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-x-hidden overflow-y-hidden">
      <BackgroundDesign />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 text-center max-w-2xl mx-auto ">
        <div className="w-md h-auto">
          <DotLottieReact
            src="https://lottie.host/embed/a267f82d-87b9-4ddc-9c4c-f0b7e4b4f7c0/sZjQAuKF5q.json"
            autoplay
            loop
          />

          <h3 className="font-black text-green lg:text-xl xl:text-3xl mb-2">
            Store Registration Under Review
          </h3>

          <p className="text-center text-disabledgrey font-semibold mb-6">
            Your store application is being reviewed by our team. We&apos;ll
            notify you once it&apos;s approved!
          </p>

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-green/20 p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                <Clock size={16} />
                Pending Review
              </div>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-green" />
                <span className="text-disabledgrey">
                  Application submitted successfully
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-green" />
                <span className="text-disabledgrey">
                  Estimated review time: 2-3 business days
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-green" />
                <span className="text-disabledgrey">
                  You&apos;ll receive an email notification when approved
                </span>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-green/5 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-green mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-disabledgrey space-y-1">
              <li>• Our team will review your store information</li>
              <li>• We&apos;ll verify your business documents</li>
              <li>• You&apos;ll receive approval notification via email</li>
              <li>• Once approved, you can start selling immediately</li>
            </ul>
          </div>

          {/* Support Info */}
          <div className="mt-6 text-center mb-20">
            <p className="text-xs text-disabledgrey mb-2">
              Need help? Contact our support team
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-green">
              <div className="flex items-center gap-1">
                <Mail size={12} />
                <span>support@ninjabazaar.com</span>
              </div>
              <div className="flex items-center gap-1">
                {/* <Phone size={12} />
                <span>+91 (555) 123-4567</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorePendingApproval
