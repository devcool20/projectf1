import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
          Privacy Policy
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        <Section title="Introduction">
          <Text style={styles.paragraph}>
            Welcome to F1 Community App ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
          </Text>
          <Text style={styles.paragraph}>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </Text>
        </Section>

        <Section title="Information We Collect">
          <SubSection title="Personal Information">
            <Text style={styles.paragraph}>
              We may collect personal information that you voluntarily provide to us when you:
            </Text>
            <BulletPoint text="Register for an account" />
            <BulletPoint text="Create or update your profile" />
            <BulletPoint text="Post content or interact with other users" />
            <BulletPoint text="Contact us for support" />
            <Text style={styles.paragraph}>
              This information may include: name, email address, username, profile picture, and any other information you choose to provide.
            </Text>
          </SubSection>

          <SubSection title="Automatically Collected Information">
            <Text style={styles.paragraph}>
              When you use our app, we may automatically collect certain information, including:
            </Text>
            <BulletPoint text="Device information (device type, operating system, unique device identifiers)" />
            <BulletPoint text="Usage data (features used, actions taken, time and date of use)" />
            <BulletPoint text="Location data (with your permission)" />
            <BulletPoint text="Log data (IP address, browser type, pages visited)" />
          </SubSection>

          <SubSection title="Information from Third-Party Services">
            <Text style={styles.paragraph}>
              We may receive information from third-party services such as:
            </Text>
            <BulletPoint text="Authentication providers (Google, Apple)" />
            <BulletPoint text="Analytics services" />
            <BulletPoint text="Payment processors" />
          </SubSection>
        </Section>

        <Section title="How We Use Your Information">
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <BulletPoint text="Provide, operate, and maintain our app" />
          <BulletPoint text="Create and manage your account" />
          <BulletPoint text="Process your transactions and send related information" />
          <BulletPoint text="Send you updates, newsletters, and marketing communications (with your consent)" />
          <BulletPoint text="Respond to your comments, questions, and provide customer support" />
          <BulletPoint text="Monitor and analyze usage and trends to improve user experience" />
          <BulletPoint text="Detect, prevent, and address technical issues and security threats" />
          <BulletPoint text="Comply with legal obligations and enforce our terms" />
        </Section>

        <Section title="Data Sharing and Disclosure">
          <Text style={styles.paragraph}>
            We may share your information in the following situations:
          </Text>
          
          <SubSection title="Service Providers">
            <Text style={styles.paragraph}>
              We may share your information with third-party service providers who perform services on our behalf, including:
            </Text>
            <BulletPoint text="Cloud hosting providers (Google Cloud Platform, Supabase)" />
            <BulletPoint text="Analytics services" />
            <BulletPoint text="Payment processors" />
            <BulletPoint text="Email service providers" />
          </SubSection>

          <SubSection title="Business Transfers">
            <Text style={styles.paragraph}>
              We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </Text>
          </SubSection>

          <SubSection title="Legal Requirements">
            <Text style={styles.paragraph}>
              We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, judicial proceedings, court orders, or legal processes.
            </Text>
          </SubSection>

          <SubSection title="With Your Consent">
            <Text style={styles.paragraph}>
              We may disclose your personal information for any other purpose with your consent.
            </Text>
          </SubSection>
        </Section>

        <Section title="Data Security">
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational security measures to protect your personal information, including:
          </Text>
          <BulletPoint text="Encryption of data in transit and at rest" />
          <BulletPoint text="Regular security assessments" />
          <BulletPoint text="Access controls and authentication" />
          <BulletPoint text="Secure data storage with Google Cloud Platform" />
          <Text style={styles.paragraph}>
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
          </Text>
        </Section>

        <Section title="Data Retention">
          <Text style={styles.paragraph}>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
          </Text>
        </Section>

        <Section title="Your Privacy Rights">
          <Text style={styles.paragraph}>
            Depending on your location, you may have the following rights regarding your personal information:
          </Text>
          <BulletPoint text="Access: Request a copy of the personal information we hold about you" />
          <BulletPoint text="Correction: Request correction of inaccurate or incomplete information" />
          <BulletPoint text="Deletion: Request deletion of your personal information" />
          <BulletPoint text="Restriction: Request restriction of processing of your information" />
          <BulletPoint text="Portability: Request transfer of your information to another service" />
          <BulletPoint text="Objection: Object to processing of your information" />
          <BulletPoint text="Withdraw Consent: Withdraw your consent at any time" />
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us using the information provided below.
          </Text>
        </Section>

        <Section title="Children's Privacy">
          <Text style={styles.paragraph}>
            Our app is not intended for children under the age of 13 (or 16 in the European Economic Area). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
          </Text>
        </Section>

        <Section title="International Data Transfers">
          <Text style={styles.paragraph}>
            Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our app, you consent to the transfer of your information to our facilities and service providers as described in this Privacy Policy.
          </Text>
        </Section>

        <Section title="Third-Party Links and Services">
          <Text style={styles.paragraph}>
            Our app may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </Text>
        </Section>

        <Section title="Google API Services">
          <Text style={styles.paragraph}>
            Our app may use Google API Services. Our use and transfer of information received from Google APIs will adhere to{' '}
            <Text style={{ color: '#dc2626', textDecorationLine: 'underline' }}>
              Google API Services User Data Policy
            </Text>
            , including the Limited Use requirements.
          </Text>
        </Section>

        <Section title="Changes to This Privacy Policy">
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
        </Section>

        <Section title="Contact Us">
          <Text style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </Text>
          <Text style={[styles.paragraph, { fontWeight: '600', marginTop: 10 }]}>
            Email: sharmadivyanshu265@gmail.com
          </Text>
          <Text style={[styles.paragraph, { fontWeight: '600' }]}>
            F1 Community App
          </Text>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginBottom: 24 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginTop: 12, marginBottom: 12 }}>
    <Text style={styles.subSectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
  <View style={{ flexDirection: 'row', marginTop: 8, paddingLeft: 8 }}>
    <Text style={{ marginRight: 8, color: '#374151' }}>•</Text>
    <Text style={[styles.paragraph, { flex: 1, marginTop: 0 }]}>{text}</Text>
  </View>
);

// Styles
const styles = {
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginTop: 8,
  },
};
