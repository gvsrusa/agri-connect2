'use client';

import { getPostHarvestTopics } from '@/lib/contentActions';
import ContentListPage from '@/components/content/ContentListPage';

export default function PostHarvestGuidancePage() {
  return (
    <ContentListPage
      fetchTopicsFunction={getPostHarvestTopics}
      translationNamespace="PostHarvest"
      detailPagePathPrefix="post-harvest-guidance"
      pageTitleKey="title"
      descriptionKey="description"
      readMorePromptKey="readMorePrompt"
      viewTopicKey="viewTopic"
      noTopicsFoundKey="noTopicsFound"
    />
  );
}