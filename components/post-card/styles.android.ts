import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1419',
    marginRight: 6,
    fontFamily: 'Inter',
  },
  teamLogo: {
    width: 20,
    height: 20,
  },
  timestamp: {
    fontSize: 13,
    color: '#536471',
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  deleteButton: {
    padding: 4,
  },
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 52,
  },
  repostText: {
    fontSize: 13,
    color: '#536471',
    marginLeft: 4,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  content: {
    fontSize: 15,
    color: '#0f1419',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginRight: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#536471',
    marginLeft: 4,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  likedText: {
    color: '#dc2626',
  },
});
