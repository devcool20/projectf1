import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  headerTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Architects Daughter',
  },
  teamLogo: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#505050', // --muted-foreground
    fontFamily: 'Architects Daughter',
  },
  content: {
    color: '#3a3a3a', // --foreground
    marginVertical: 8,
    fontFamily: 'Architects Daughter',
    lineHeight: 20,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftActions: {
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
    color: '#505050', // --muted-foreground
    marginLeft: 4,
    fontFamily: 'Architects Daughter',
  },
}); 