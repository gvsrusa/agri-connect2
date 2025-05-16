'use client';

import { getAdvisoryContent } from '@/lib/contentActions';
import ContentDetailPage from '@/components/content/ContentDetailPage';

interface CropAdvisoryDetailPageProps {
  params: {
    topicKey: string;
  };
}

export default function CropAdvisoryDetailPage({ params }: CropAdvisoryDetailPageProps) {
  const { topicKey } = params;
  
  return (
    <ContentDetailPage
      topicKey={topicKey}
      fetchContentFunction={getAdvisoryContent}
      translationNamespace="CropAdvisory"
      backButtonTextKey="backToTopics"
      backLinkPath="/crop-advisory"
      categoryBadgeClassName="bg-blue-100 text-blue-800"
      viewAllTopicsKey="viewAllTopics"
    />
  );
}