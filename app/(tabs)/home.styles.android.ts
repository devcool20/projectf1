import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  scrollView: {
    flex: 1,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3a3a3a',
    fontFamily: 'Architects Daughter',
  },

  // Welcome Banner
  welcomeBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  bannerContent: {
    padding: 24,
  },
  
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    fontFamily: 'Architects Daughter',
  },
  
  bannerSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'Architects Daughter',
  },
  
  bannerDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  bannerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  statText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '600',
  },

  // Welcome Message
  welcomeMessage: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  
  welcomeText: {
    fontSize: 14,
    color: '#3a3a3a',
    lineHeight: 20,
    fontFamily: 'Architects Daughter',
  },
  
  signInButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Architects Daughter',
  },

  // Quick Access Section
  quickAccessContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  
  quickAccessItem: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'Architects Daughter',
  },
  
  quickAccessDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  
  quickAccessArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  // News Section
  newsContainer: {
    marginBottom: 24,
  },
  
  newsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  newsUpdateText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '600',
  },
  
  newsScrollContainer: {
    paddingHorizontal: 16,
  },
  
  newsCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  
  newsImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e5e5',
  },
  
  newsContent: {
    padding: 16,
  },
  
  newsCategory: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 22,
    fontFamily: 'Architects Daughter',
  },
  
  newsSummary: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 12,
  },
  
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  newsTime: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },

  // Bottom spacing
  bottomSpacing: {
    height: 80,
  },

  // F1 Theme Colors
  f1Red: {
    color: '#dc2626',
  },
  
  f1Black: {
    color: '#000000',
  },
  
  f1White: {
    color: '#ffffff',
  },
  
  f1RedBackground: {
    backgroundColor: '#dc2626',
  },
  
  f1BlackBackground: {
    backgroundColor: '#000000',
  },
  
  f1WhiteBackground: {
    backgroundColor: '#ffffff',
  },
});

export default styles;
