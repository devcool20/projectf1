import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const isSmallWeb = Platform.OS === 'web' && screenWidth < 450;
const isVerySmallWeb = Platform.OS === 'web' && screenWidth < 400;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: isSmallWeb ? 8 : 16,
    paddingLeft: isSmallWeb ? 4 : 16,
    alignItems: isSmallWeb ? 'flex-start' : 'stretch',
    backgroundColor: '#ffe5e5', // soft reddish background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e3e3e3', // --muted
  },
  userInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    color: '#000000',
  },
  teamLogo: {
    width: 24, // Changed from 20 to 24
    height: 24, // Changed from 20 to 24
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#505050',
  },
  content: {
    color: '#000000',
    marginVertical: 8,
    lineHeight: 20,
    fontSize: 16,
  },
  imageContainer: {
    marginTop: 12,
    alignSelf: isSmallWeb ? 'flex-start' : 'center',
    marginLeft: isVerySmallWeb ? 8 : isSmallWeb ? 0 : undefined,
    marginRight: isVerySmallWeb ? 8 : undefined,
    width: isSmallWeb ? '95vw' : undefined,
    maxWidth: isSmallWeb ? '95vw' : undefined,
    backgroundColor: '#ffe5e5', // soft reddish background
    borderRadius: 10,
  },
  postImage: {
    height: isSmallWeb ? 180 : 320,
    borderRadius: 10, // Using --radius: 0.625rem = 10px
    width: isSmallWeb ? '95vw' : 300,
    maxWidth: isSmallWeb ? '95vw' : '100%',
    minWidth: isSmallWeb ? 0 : undefined,
    marginLeft: isVerySmallWeb ? 0 : isSmallWeb ? 0 : undefined,
    marginRight: isVerySmallWeb ? 0 : undefined,
    paddingLeft: isVerySmallWeb ? 0 : undefined,
    paddingRight: isVerySmallWeb ? 0 : undefined,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#505050',
    marginLeft: 4,
  },
});

export default styles;
