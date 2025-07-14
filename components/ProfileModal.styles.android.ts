import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#606060',
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  fullName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Architects Daughter',
    textAlign: 'center',
  },
  username: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontFamily: 'Architects Daughter',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a3a3a',
    marginBottom: 16,
    fontFamily: 'Architects Daughter',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#e3e3e3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#747272',
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Architects Daughter',
  },
  infoValue: {
    color: '#3a3a3a',
    fontWeight: '500',
    fontSize: 16,
    fontFamily: 'Architects Daughter',
  },
  teamSection: {
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: '#e3e3e3',
    borderRadius: 12,
    padding: 16,
  },
  currentTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogo: {
    width: 36, // Changed from 32 to 36
    height: 36, // Changed from 32 to 36
    borderRadius: 4,
    marginRight: 12,
  },
  teamName: {
    color: '#3a3a3a',
    fontWeight: '500',
    fontSize: 16,
    fontFamily: 'Architects Daughter',
  },
  teamScrollView: {
    paddingVertical: 8,
  },
  teamOptionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  teamOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 12,
  },
  teamOptionSelected: {
    borderColor: '#606060',
    backgroundColor: 'rgba(96, 96, 96, 0.1)',
  },
  teamOptionUnselected: {
    borderColor: '#747272',
    backgroundColor: '#f9f9f9',
  },
  teamOptionLogo: {
    width: 28, // Changed from 24 to 28
    height: 28, // Changed from 24 to 28
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#e3e3e3',
    borderRadius: 12,
    padding: 16,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3a3a3a',
    marginTop: 8,
    fontFamily: 'Architects Daughter',
  },
  statLabel: {
    color: '#747272',
    fontSize: 14,
    fontFamily: 'Architects Daughter',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },
  notLoggedInContainer: {
    padding: 24,
    alignItems: 'center',
  },
  notLoggedInText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#3a3a3a',
    marginBottom: 24,
    fontFamily: 'Architects Daughter',
  },
  loginButton: {
    backgroundColor: '#606060',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },
}); 