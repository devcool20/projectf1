import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // --card
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#747272', // --border
    backgroundColor: '#ffffff', // --card
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Architects Daughter',
  },
  // Main content area
  contentRow: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#747272', // --border
  },
  // Feed container
  feedContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 0,
  },
  feed: {
    width: '100%',
    maxWidth: 672, // lg:max-w-2xl
  },
  // Feed header
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#747272', // --border
    padding: 16,
    backgroundColor: '#ffffff', // --card
  },
  feedHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Architects Daughter',
  },
  feedHeaderMutedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#505050', // --muted-foreground
    fontFamily: 'Architects Daughter',
  },
  // Create thread section
  createThreadContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9', // --background
  },
  createThreadRow: {
    flexDirection: 'row',
  },
  createThreadInputContainer: {
    flex: 1,
    marginLeft: 16,
  },
  textInput: {
    fontSize: 18,
    color: '#3a3a3a', // --foreground
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    fontFamily: 'Architects Daughter',
    lineHeight: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 192,
    borderRadius: 10, // --radius
    backgroundColor: '#e3e3e3', // --muted
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
  },
  createThreadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#505050', // --muted-foreground
    fontFamily: 'Architects Daughter',
  },
  // Thread feed item
  threadTouchable: {
    borderBottomWidth: 1,
    borderColor: '#747272', // --border
    backgroundColor: '#ffffff', // --card
  },
  // Activity Indicator
  loadingIndicator: {
    marginTop: 32,
  },
}); 