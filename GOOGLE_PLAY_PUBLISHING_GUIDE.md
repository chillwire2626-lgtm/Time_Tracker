# Google Play Store Publishing Guide for Study Time Tracker

## 📱 Required Assets

### 1. App Icon (512 × 512 pixels)
- **Format**: PNG or WebP
- **Size**: Maximum 1024 KB
- **Requirements**: 
  - High quality, clear design
  - Represents your app's purpose
  - No text or small details
  - Should work well at small sizes

### 2. Feature Graphic (1024 × 500 pixels)
- **Format**: JPG or PNG
- **Size**: Maximum 1 MB
- **Requirements**:
  - Eye-catching design
  - Can include app name and key features
  - Should represent your app's value proposition

### 3. Screenshots (Minimum 2 per device type)
- **Phone Screenshots**: 16:9 or 9:16 aspect ratio
- **Tablet Screenshots**: 16:10 or 10:16 aspect ratio
- **Requirements**:
  - Show key features and functionality
  - High quality, clear images
  - No device frames or mockups
  - Show real app content

## 🏗️ Building Your App

### Step 1: Generate Release Keystore (if not already done)
```bash
# Navigate to android/app directory
cd android/app

# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias timetracker-key -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Build Release AAB
```bash
# From project root directory
npm run build:aab
```

The AAB file will be generated at: `android/app/build/outputs/bundle/release/app-release.aab`

## 📝 Google Play Console Setup

### 1. App Details
- **App Name**: Study Time Tracker
- **Short Description**: Track your study time with Pomodoro technique and detailed analytics
- **Full Description**: 
```
Study Time Tracker is a powerful productivity app designed to help students and professionals manage their study time effectively. 

Key Features:
• Pomodoro Timer - 25-minute focused study sessions
• Course Management - Organize study sessions by subject
• Detailed Analytics - Track your progress and productivity
• Customizable Settings - Adjust timer durations and breaks
• Dark/Light Theme - Comfortable viewing in any environment
• Offline Functionality - Works without internet connection

Perfect for students, professionals, and anyone looking to improve their focus and productivity through structured study sessions.
```

### 2. App Category
- **Category**: Education
- **Content Rating**: Everyone
- **Price**: Free

### 3. Contact Information
- **Email**: [your-email@example.com]
- **Website**: [your-website.com]
- **Privacy Policy**: [your-privacy-policy-url]

### 4. Content Rating Questionnaire
Answer questions about:
- Violence
- Sexual content
- Profanity
- Controlled substances
- Simulated gambling
- User-generated content

### 5. Target Audience
- **Primary**: Students and professionals
- **Age Range**: 13+ (Teen and Adult)

## 🧪 Testing Process

### Internal Testing
1. Upload AAB to Internal Testing track
2. Add testers (yourself and team members)
3. Test app functionality thoroughly
4. Verify all features work as expected

### Closed Testing (Required - 14 days minimum)
1. Create Closed Testing track
2. Upload AAB
3. Add at least 12 testers
4. Share opt-in link with testers
5. Collect feedback and fix issues
6. Update builds as needed

### Production Release
1. Complete closed testing period
2. Apply for production access
3. Upload final AAB
4. Set release notes
5. Choose release countries
6. Submit for Google review

## 📋 Pre-Launch Checklist

### Technical Requirements
- [ ] App builds successfully
- [ ] All features work correctly
- [ ] No crashes or major bugs
- [ ] App meets Google Play policies
- [ ] Privacy policy is accessible
- [ ] App icon and graphics are ready
- [ ] Screenshots are prepared

### Content Requirements
- [ ] App description is complete
- [ ] Keywords are relevant
- [ ] Content rating is accurate
- [ ] Target audience is defined
- [ ] Contact information is provided

### Legal Requirements
- [ ] Privacy policy is published
- [ ] Terms of service (if applicable)
- [ ] App complies with local laws
- [ ] All permissions are justified

## 🚀 Launch Strategy

### Soft Launch
- Start with a few countries
- Monitor user feedback
- Fix any issues quickly
- Gradually expand to more regions

### Full Launch
- Release to all target countries
- Monitor app performance
- Respond to user reviews
- Plan future updates

## 📊 Post-Launch Monitoring

### Key Metrics to Track
- App installs and uninstalls
- User ratings and reviews
- Crash reports
- Feature usage analytics
- User retention rates

### Regular Updates
- Fix bugs and issues
- Add new features
- Improve user experience
- Respond to user feedback

## 🔧 Troubleshooting Common Issues

### Build Issues
- Ensure all dependencies are installed
- Check Android SDK versions
- Verify keystore configuration
- Clean and rebuild project

### Upload Issues
- Check AAB file size (max 150MB)
- Verify app signing
- Ensure all required fields are filled
- Check for policy violations

### Review Rejections
- Read rejection reasons carefully
- Address all policy violations
- Update app content if needed
- Resubmit with fixes

## 📞 Support Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Android Developer Documentation](https://developer.android.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)

---

**Note**: This guide provides a comprehensive overview of the publishing process. Always refer to the latest Google Play Console documentation for the most up-to-date requirements and procedures.
