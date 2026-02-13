import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
          Terms of Service
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        <Section title="Agreement to Terms">
          <Text style={styles.paragraph}>
            Welcome to F1 Community App ("Company," "we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our mobile application, website, and services (collectively, the "Service").
          </Text>
          <Text style={styles.paragraph}>
            By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </Text>
        </Section>

        <Section title="Eligibility">
          <Text style={styles.paragraph}>
            You must be at least 13 years old to use our Service. If you are under 18, you represent that you have your parent or guardian's permission to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
          </Text>
        </Section>

        <Section title="User Accounts">
          <SubSection title="Account Creation">
            <Text style={styles.paragraph}>
              To access certain features of the Service, you may be required to create an account. You agree to:
            </Text>
            <BulletPoint text="Provide accurate, current, and complete information" />
            <BulletPoint text="Maintain and promptly update your account information" />
            <BulletPoint text="Keep your password secure and confidential" />
            <BulletPoint text="Notify us immediately of any unauthorized use of your account" />
            <BulletPoint text="Be responsible for all activities that occur under your account" />
          </SubSection>

          <SubSection title="Account Termination">
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
            </Text>
          </SubSection>
        </Section>

        <Section title="User Content">
          <SubSection title="Your Content">
            <Text style={styles.paragraph}>
              Our Service allows you to post, upload, and share content, including but not limited to text, images, videos, and comments ("User Content"). You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display your User Content in connection with operating and providing the Service.
            </Text>
          </SubSection>

          <SubSection title="Content Restrictions">
            <Text style={styles.paragraph}>
              You agree not to post User Content that:
            </Text>
            <BulletPoint text="Is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable" />
            <BulletPoint text="Infringes any patent, trademark, trade secret, copyright, or other proprietary rights" />
            <BulletPoint text="Contains software viruses or any other malicious code" />
            <BulletPoint text="Impersonates any person or entity or misrepresents your affiliation with a person or entity" />
            <BulletPoint text="Violates the privacy or publicity rights of others" />
            <BulletPoint text="Contains false or misleading information" />
            <BulletPoint text="Promotes discrimination, bigotry, racism, hatred, or violence" />
            <BulletPoint text="Is spam, advertising, or promotional material (unless authorized by us)" />
          </SubSection>

          <SubSection title="Content Moderation">
            <Text style={styles.paragraph}>
              We reserve the right, but are not obligated, to monitor, review, edit, or remove User Content at our sole discretion, without notice, for any reason, including if we believe it violates these Terms or is otherwise objectionable.
            </Text>
          </SubSection>
        </Section>

        <Section title="Acceptable Use">
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <BulletPoint text="Use the Service for any illegal purpose or in violation of any laws" />
          <BulletPoint text="Attempt to gain unauthorized access to the Service or other users' accounts" />
          <BulletPoint text="Interfere with or disrupt the Service or servers or networks connected to the Service" />
          <BulletPoint text="Use any automated means (bots, scrapers, etc.) to access the Service without our permission" />
          <BulletPoint text="Collect or harvest any personal information from other users" />
          <BulletPoint text="Use the Service to transmit spam, chain letters, or unsolicited messages" />
          <BulletPoint text="Impersonate or attempt to impersonate the Company, employees, other users, or any other person or entity" />
          <BulletPoint text="Reverse engineer, decompile, or disassemble any part of the Service" />
          <BulletPoint text="Remove, circumvent, or disable any security features or access controls of the Service" />
        </Section>

        <Section title="Intellectual Property Rights">
          <SubSection title="Our Content">
            <Text style={styles.paragraph}>
              The Service and its original content (excluding User Content), features, and functionality are owned by F1 Community App and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </Text>
          </SubSection>

          <SubSection title="Trademarks">
            <Text style={styles.paragraph}>
              The F1 Community App name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of F1 Community App or its affiliates. You may not use such marks without our prior written permission.
            </Text>
            <Text style={styles.paragraph}>
              Formula 1, F1, and related trademarks are owned by Formula One Licensing B.V. We are not affiliated with, endorsed, or sponsored by Formula One Licensing B.V. or any of its affiliates.
            </Text>
          </SubSection>

          <SubSection title="Copyright Policy">
            <Text style={styles.paragraph}>
              We respect the intellectual property rights of others. If you believe that any content on our Service infringes your copyright, please contact us with:
            </Text>
            <BulletPoint text="A description of the copyrighted work" />
            <BulletPoint text="The location of the infringing material" />
            <BulletPoint text="Your contact information" />
            <BulletPoint text="A statement of good faith belief that the use is not authorized" />
            <BulletPoint text="A statement that the information is accurate and you are authorized to act" />
          </SubSection>
        </Section>

        <Section title="Third-Party Services and Links">
          <Text style={styles.paragraph}>
            The Service may contain links to third-party websites or services that are not owned or controlled by F1 Community App. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </Text>
          <Text style={styles.paragraph}>
            We are not responsible for any goods, services, or content available through third-party websites or services. You acknowledge and agree that we shall not be liable for any damages or losses caused by your use of any third-party services.
          </Text>
        </Section>

        <Section title="Purchases and Payments">
          <Text style={styles.paragraph}>
            If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information, including payment information. You agree that:
          </Text>
          <BulletPoint text="All information you provide is accurate and complete" />
          <BulletPoint text="You will maintain valid payment methods" />
          <BulletPoint text="You are authorized to use the payment method" />
          <BulletPoint text="All purchases are final and non-refundable unless otherwise stated" />
          <Text style={styles.paragraph}>
            We reserve the right to refuse or cancel orders at our sole discretion, including for reasons such as product availability, errors in pricing or product information, or suspected fraudulent activity.
          </Text>
        </Section>

        <Section title="Disclaimers and Limitation of Liability">
          <SubSection title="Service 'As Is'">
            <Text style={styles.paragraph}>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </Text>
            <Text style={styles.paragraph}>
              We do not warrant that:
            </Text>
            <BulletPoint text="The Service will be available at all times" />
            <BulletPoint text="The Service will be error-free or uninterrupted" />
            <BulletPoint text="The results obtained from using the Service will be accurate or reliable" />
            <BulletPoint text="Any errors in the Service will be corrected" />
          </SubSection>

          <SubSection title="Limitation of Liability">
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL F1 COMMUNITY APP, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </Text>
            <BulletPoint text="Your access to or use of (or inability to access or use) the Service" />
            <BulletPoint text="Any conduct or content of any third party on the Service" />
            <BulletPoint text="Any content obtained from the Service" />
            <BulletPoint text="Unauthorized access, use, or alteration of your transmissions or content" />
          </SubSection>
        </Section>

        <Section title="Indemnification">
          <Text style={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless F1 Community App and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or expenses (including attorney's fees) arising from:
          </Text>
          <BulletPoint text="Your use of the Service" />
          <BulletPoint text="Your violation of these Terms" />
          <BulletPoint text="Your violation of any third-party rights, including intellectual property rights" />
          <BulletPoint text="Any User Content you post or share on the Service" />
        </Section>

        <Section title="Governing Law and Dispute Resolution">
          <SubSection title="Governing Law">
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which F1 Community App operates, without regard to its conflict of law provisions.
            </Text>
          </SubSection>

          <SubSection title="Dispute Resolution">
            <Text style={styles.paragraph}>
              Any dispute arising from these Terms or the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court for infringement of intellectual property rights.
            </Text>
          </SubSection>
        </Section>

        <Section title="Changes to Terms">
          <Text style={styles.paragraph}>
            We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Text>
          <Text style={styles.paragraph}>
            By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must stop using the Service.
          </Text>
        </Section>

        <Section title="Severability">
          <Text style={styles.paragraph}>
            If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid or unenforceable provision will be deemed modified to the extent necessary to make it valid and enforceable.
          </Text>
        </Section>

        <Section title="Waiver">
          <Text style={styles.paragraph}>
            No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
          </Text>
        </Section>

        <Section title="Entire Agreement">
          <Text style={styles.paragraph}>
            These Terms constitute the entire agreement between you and F1 Community App regarding the use of the Service and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.
          </Text>
        </Section>

        <Section title="Contact Information">
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
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
