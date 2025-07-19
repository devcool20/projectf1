import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bookmark, X } from 'lucide-react-native';
import { formatThreadTimestamp } from '@/lib/utils';

const TEAM_LOGOS: { [key: string]: any } = {
  'Red Bull Racing': require('@/team-logos/redbull.png'),
  'Scuderia Ferrari': require('@/team-logos/ferrari.png'),
  'Mercedes-AMG': require('@/team-logos/mercedes.png'),
  'McLaren': require('@/team-logos/mclaren.png'),
  'Aston Martin': require('@/team-logos/astonmartin.png'),
  'Alpine': require('@/team-logos/alpine.png'),
  'Williams': require('@/team-logos/williams.png'),
  'Haas': require('@/team-logos/haas.png'),
  'Stake F1': require('@/team-logos/stake.png'),
  'RB': require('@/team-logos/racingbulls.png'),
  'FIA': require('@/team-logos/fia.png'), // Admin-only team
};

// Admin logo
const ADMIN_LOGO = require('@/assets/images/favicon.png');

interface BookmarkCardProps {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  favoriteTeam?: string;
  isAdmin?: boolean;
  onBookmarkPress: () => void;
  onThreadPress: () => void;
}

export default function BookmarkCard({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  favoriteTeam,
  isAdmin = false,
  onBookmarkPress,
  onThreadPress,
}: BookmarkCardProps) {
  
  // Determine which logo to show
  const getLogoToShow = () => {
    if (isAdmin) {
      return ADMIN_LOGO;
    }
    if (favoriteTeam && TEAM_LOGOS[favoriteTeam]) {
      return TEAM_LOGOS[favoriteTeam];
    }
    return null;
  };

  const logoToShow = getLogoToShow();
  const [expanded, setExpanded] = React.useState(false);
  const contentLines = content.split('\n');
  const shouldTruncate = contentLines.length > 4 && !expanded;
  const displayedContent = shouldTruncate ? contentLines.slice(0, 4).join('\n') : content;

  return (
    <TouchableOpacity 
      onPress={onThreadPress}
      style={{ 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e5e5', 
        backgroundColor: '#ffffff' 
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar Column */}
        <Image
          source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6' }}
        />
        {/* Content Column */}
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', marginRight: 8 }}>{username}</Text>
            {logoToShow && (
              <Image 
                source={logoToShow} 
                style={{ width: 20, height: 18, marginRight: 8 }}
                resizeMode="contain"
              />
            )}
            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }} 
                style={{ width: 60, height: 40, borderRadius: 8, marginLeft: 'auto' }}
                resizeMode="cover"
              />
            )}
          </View>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 8 }}>{formatThreadTimestamp(timestamp)}</Text>
          {/* Content */}
          <Text style={{ fontSize: 14, color: '#000000', lineHeight: 20, marginBottom: 8 }}>
            {displayedContent}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>Read more</Text>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={onBookmarkPress} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Bookmark size={14} color="#dc2626" fill="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
} 