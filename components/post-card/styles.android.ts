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
    fontSize: 15,
    fontWeight: '600',
    color: '#3a3a3a',
    marginRight: 8,
    fontFamily: 'Formula1-Regular',
  },
  teamLogo: {
    width: 20,
    height: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter',
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
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  content: {
    fontSize: 14,
    color: '#3a3a3a',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  likedText: {
    color: '#dc2626',
  },
});
