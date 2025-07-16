import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
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
    alignSelf: 'flex-start',
  },
  postImage: {
    height: 320,
    borderRadius: 10, // Using --radius: 0.625rem = 10px
    width: 300,
    maxWidth: '100%',
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
