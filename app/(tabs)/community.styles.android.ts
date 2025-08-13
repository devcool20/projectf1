import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a3a3a',
    fontFamily: 'Formula1-Regular',
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
    borderColor: '#ffffff', // --border
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
    borderColor: '#e5e5e5', // web border
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff', // --card
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626',
  },
  tabText: {
    fontSize: 15,
    color: '#657786',
    fontWeight: '600',
    fontFamily: 'Formula1-Regular',
  },
  activeTabText: {
    color: '#dc2626',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#3a3a3a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  feedHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a3a3a', // --foreground
    fontFamily: 'Formula1-Regular',
  },
  feedHeaderMutedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#505050', // --muted-foreground
    fontFamily: 'Formula1-Regular',
  },
  // Create thread section
  createThreadContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
    color: '#3a3a3a',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 12,
    borderRadius: 8,
    lineHeight: 24,
    minHeight: 40,
    fontFamily: 'Inter',
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
    color: '#dc2626', // F1 red theme
    fontFamily: 'Formula1-Regular',
  },
  // Thread feed item
  threadTouchable: {
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  // Activity Indicator
  loadingIndicator: {
    marginTop: 32,
  },
});
export default styles;

