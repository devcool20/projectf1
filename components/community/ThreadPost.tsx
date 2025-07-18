import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ThreadPostProps {
  post: {
    username: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
  };
}

export default function ThreadPost({ post }: ThreadPostProps) {
  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        {/* Avatar Column */}
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#888' }}>
            {post.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        {/* Content Column */}
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#000' }}>{post.username}</Text>
          <Text style={{ fontSize: 13, color: '#888', marginTop: -2, marginLeft: 2 }}>{new Date(post.timestamp).toLocaleString()}</Text>
          <Text style={{ color: '#000', fontSize: 16, marginVertical: 8 }}>{post.content}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Text style={{ fontSize: 14 }}>🤍</Text>
              {post.likes > 0 && <Text style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>{post.likes}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Text style={{ fontSize: 14 }}>💬</Text>
              {post.comments > 0 && <Text style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>{post.comments}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14 }}>🔗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
} 