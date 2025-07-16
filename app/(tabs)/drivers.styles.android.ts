import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  listContainer: {
    paddingBottom: 20,
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

  // Header Banner
  headerBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  headerContent: {
    padding: 24,
  },
  
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    fontFamily: 'Architects Daughter',
  },
  
  headerSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'Architects Daughter',
  },
  
  headerStats: {
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

  // Search and Filter Section
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#3a3a3a',
    fontFamily: 'Architects Daughter',
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    gap: 8,
  },
  
  filterButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },

  // Filters Section
  filtersContainer: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  filterGroup: {
    marginRight: 24,
  },
  
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3a3a3a',
    marginBottom: 8,
    fontFamily: 'Architects Daughter',
  },
  
  filterChip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  
  filterChipActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  
  filterChipText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Architects Daughter',
  },
  
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  resetFiltersButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  
  resetFiltersText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },

  // Results Info
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  resultsText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Architects Daughter',
  },
  
  searchResultsText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'Architects Daughter',
  },

  // Driver Card
  driverCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  driverPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  driverPositionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Architects Daughter',
  },
  
  driverInfo: {
    flex: 1,
  },
  
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Architects Daughter',
  },
  
  driverTeam: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    fontFamily: 'Architects Daughter',
  },
  
  driverNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  driverNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Architects Daughter',
  },
  
  driverCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  
  driverImageContainer: {
    width: 80,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  
  driverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  
  nationalityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  nationalityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },
  
  driverStats: {
    flex: 1,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
    fontFamily: 'Architects Daughter',
  },
  
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
    fontFamily: 'Architects Daughter',
  },
  
  driverCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  teamColorBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
  },
  
  chevronRight: {
    marginLeft: 8,
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
