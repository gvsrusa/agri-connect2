'use client';

import { getAdvisoryTopics } from '@/lib/contentActions';
import ContentListPage from '@/components/content/ContentListPage';

export default function CropAdvisoryPage() {
  return (
    <ContentListPage
      fetchTopicsFunction={getAdvisoryTopics}
      translationNamespace="CropAdvisory"
      detailPagePathPrefix="crop-advisory"
      pageTitleKey="title"
      descriptionKey="description"
      readMorePromptKey="readMorePrompt"
      viewTopicKey="viewTopic"
      noTopicsFoundKey="noTopicsFound"
    />
  );
}