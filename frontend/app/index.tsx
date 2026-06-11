import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
const { width } = Dimensions.get('window');

const colors = {
  primary: '#FF6B35',
  secondary: '#004E89',
  accent: '#1ABC9C',
  success: '#27AE60',
  bg_light: '#F5F5F5',
  bg_dark: '#1A1A1A',
  text_dark: '#000',
  text_light: '#FFF',
};

interface PartyInfo {
  name: string;
  tagline: string;
  description: string;
  election_symbol: string;
}

interface Demand {
  id?: string;
  title: string;
  description: string;
  icon: string;
}

interface Update {
  id?: string;
  title: string;
  content: string;
  image_url?: string;
  category: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [party, setParty] = useState<PartyInfo | null>(null);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [members, setMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partyRes, demandsRes, updatesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/party`),
        axios.get(`${BACKEND_URL}/api/manifesto`),
        axios.get(`${BACKEND_URL}/api/updates`),
      ]);
      setParty(partyRes.data);
      setDemands(demandsRes.data);
      setUpdates(updatesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, {
        password: adminPassword,
      });
      setAdminToken(res.data.token);
      setAdminMode(true);
      Alert.alert('Success', 'Admin mode activated!');
      setAdminPassword('');
    } catch (error) {
      Alert.alert('Error', 'Invalid admin password');
    }
  };

  const handleRegisterMember = async () => {
    if (!newMemberName || !newMemberEmail) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/members`, {
        name: newMemberName,
        email: newMemberEmail,
      });
      Alert.alert('Success', 'Welcome to the movement!');
      setNewMemberName('');
      setNewMemberEmail('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please check your email.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>GenZ</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAdminMode(!adminMode)}
          style={styles.editButton}
        >
          <Ionicons name="pencil" size={20} color={colors.text_light} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{party?.name || 'GenZ Janta Party'}</Text>
      <Text style={styles.tagline}>{party?.tagline || 'Powered by Youth, Driven by Truth'}</Text>
      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>JOIN THE PARTY</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHome = () => (
    <View>
      {renderHeader()}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Voice of the Youth &</Text>
        <Text style={[styles.heroTitle, { color: colors.primary }]}>Forgotten.</Text>
        <Text style={styles.heroDescription}>
          {party?.description || 'A political movement for the people the system forgot to count.'}
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>DEMANDS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>CORPORATE DONORS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>∞</Text>
          <Text style={styles.statLabel}>PATIENCE</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>FOUNDER</Text>
        </View>
      </View>

      {/* Election Symbol */}
      <View style={styles.symbolSection}>
        <View style={styles.symbolCard}>
          <Text style={styles.symbolLabel}>ELECTION SYMBOL</Text>
          <Text style={styles.symbolTitle}>{party?.election_symbol || 'The Raised Hand ✊'}</Text>
          <Text style={styles.symbolTagline}>
            Vote for the hand. Vote for the youth.
          </Text>
        </View>
      </View>

      {/* Call to Action Buttons */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.ctaButton, styles.ctaButtonPrimary]}
          onPress={() => setActiveTab('join')}
        >
          <Text style={styles.ctaButtonText}>Join the Party →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctaButton, styles.ctaButtonSecondary]}
          onPress={() => setActiveTab('manifesto')}
        >
          <Text style={styles.ctaButtonTextSecondary}>Read the Manifesto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderManifesto = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Our 7 Demands</Text>
      {demands.map((demand, index) => (
        <View key={index} style={styles.demandCard}>
          <Text style={styles.demandIcon}>{demand.icon}</Text>
          <View style={styles.demandContent}>
            <Text style={styles.demandTitle}>{demand.title}</Text>
            <Text style={styles.demandDescription}>{demand.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderUpdates = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Latest Updates</Text>
      {updates.length > 0 ? (
        updates.map((update, index) => (
          <View key={index} style={styles.updateCard}>
            {update.image_url && (
              <Image
                source={{ uri: update.image_url }}
                style={styles.updateImage}
              />
            )}
            <View style={styles.updateContent}>
              <Text style={styles.updateCategory}>{update.category?.toUpperCase()}</Text>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateText}>{update.content}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.placeholderText}>No updates yet. Stay tuned!</Text>
      )}
    </View>
  );

  const renderJoinForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Join the Movement</Text>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={newMemberName}
          onChangeText={setNewMemberName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Your Email"
          value={newMemberEmail}
          onChangeText={setNewMemberEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegisterMember}
        >
          <Text style={styles.submitButtonText}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAdminPanel = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Admin Panel</Text>
      {!adminToken ? (
        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Admin Password"
            value={adminPassword}
            onChangeText={setAdminPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAdminLogin}
          >
            <Text style={styles.submitButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.adminMessage}>✅ Admin mode active</Text>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.success }]}
            onPress={() => {
              setAdminToken(null);
              setAdminMode(false);
            }}
          >
            <Text style={styles.submitButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && activeTab === 'home' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'manifesto' && renderManifesto()}
            {activeTab === 'updates' && renderUpdates()}
            {activeTab === 'join' && renderJoinForm()}
            {adminMode && renderAdminPanel()}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            {[
              { id: 'home', label: 'Home', icon: 'home' },
              { id: 'manifesto', label: 'Manifesto', icon: 'document-text' },
              { id: 'updates', label: 'Updates', icon: 'newspaper' },
              { id: 'join', label: 'Join', icon: 'hand-right' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.navItem}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={24}
                  color={activeTab === tab.id ? colors.primary : '#999'}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: activeTab === tab.id ? colors.primary : '#999' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.bg_dark,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.text_light,
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.text_light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text_light,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 15,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: colors.text_light,
    fontWeight: 'bold',
    fontSize: 14,
  },
  ctaButtonPrimary: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  ctaButtonSecondary: {
    backgroundColor: colors.text_light,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  ctaButtonTextSecondary: {
    color: colors.text_dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  heroSection: {
    padding: 20,
    backgroundColor: colors.bg_light,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text_dark,
    lineHeight: 44,
  },
  heroDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.text_light,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  symbolSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  symbolCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: colors.text_dark,
    padding: 20,
    borderRadius: 10,
  },
  symbolLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
  },
  symbolTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text_dark,
    marginTop: 10,
  },
  symbolTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  ctaSection: {
    paddingVertical: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text_dark,
    marginBottom: 15,
  },
  demandCard: {
    backgroundColor: colors.text_light,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  demandIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  demandContent: {
    flex: 1,
  },
  demandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text_dark,
  },
  demandDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  updateCard: {
    backgroundColor: colors.text_light,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  updateImage: {
    width: '100%',
    height: 200,
  },
  updateContent: {
    padding: 15,
  },
  updateCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text_dark,
    marginTop: 5,
  },
  updateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  formCard: {
    backgroundColor: colors.text_light,
    padding: 15,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: colors.text_dark,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.text_light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  adminMessage: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.text_light,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 5,
  },
});
