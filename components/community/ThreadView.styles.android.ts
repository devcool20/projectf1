import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9f9f9', // --background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#747272', // --border
    backgroundColor: '#ffffff' // --card
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Architects Daughter',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#747272', // --border
    backgroundColor: '#ffffff', // --card
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  replyBoxInline: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9', // --background
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#747272', // --border
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    color: '#3a3a3a', // --foreground
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 10, // --radius
    backgroundColor: '#ffffff', // --input
    fontSize: 14,
    minHeight: 36,
    maxHeight: 36,
    borderWidth: 1,
    borderColor: '#ffffff', // --border
    fontFamily: 'Architects Daughter',
  },
  imagePickerButton: {
    padding: 6,
    marginRight: 8,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 4,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10, // --radius
    backgroundColor: '#e3e3e3', // --muted
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButton: {
    backgroundColor: '#606060', // --primary
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10, // --radius
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  replyButtonDisabled: {
    backgroundColor: '#e3e3e3', // --muted
  },
  replyButtonText: {
    color: '#f0f0f0', // --primary-foreground
    fontWeight: 'bold',
    fontFamily: 'Architects Daughter',
  },
  replyImage: {
    width: '100%',
    height: 150,
    borderRadius: 10, // --radius
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#e3e3e3', // --muted
  },
  commentsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: 400,
    flex: 1,
    backgroundColor: '#f9f9f9', // --background
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#ffffff', // --card
    padding: 12,
    borderRadius: 10, // --radius
    borderWidth: 1,
    borderColor: '#747272', // --border
  },
  commentContent: {
    flex: 1,
  },
  commentUsernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Architects Daughter',
  },
  commentTeamLogo: {
    width: 12,
    height: 12,
    marginLeft: 6,
  },
  commentText: {
    color: '#3a3a3a', // --foreground
    marginBottom: 8,
    fontFamily: 'Architects Daughter',
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#505050', // --muted-foreground
    fontSize: 12,
    fontFamily: 'Architects Daughter',
  },
}); 