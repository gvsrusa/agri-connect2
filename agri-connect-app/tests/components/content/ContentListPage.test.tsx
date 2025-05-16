import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentListPage, { ContentListPageProps, Topic } from '@/components/content/ContentListPage';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockT = jest.fn((key) => key); // Simple mock for translation
const mockCommonT = jest.fn((key) => key);
const mockLocale = jest.fn(() => 'en');
const mockRouterPush = jest.fn();

const mockFetchTopicsSuccess = jest.fn(async (locale: string): Promise<{ data: Topic[] | null; error: string | null }> => {
  return {
    data: [
      { topic_key: 'topic1', title: 'Topic 1 Title' },
      { topic_key: 'topic2', title: 'Topic 2 Title' },
    ],
    error: null,
  };
});

const mockFetchTopicsEmpty = jest.fn(async (locale: string): Promise<{ data: Topic[] | null; error: string | null }> => {
  return { data: [], error: null };
});

const mockFetchTopicsError = jest.fn(async (locale: string): Promise<{ data: Topic[] | null; error: string | null }> => {
  return { data: null, error: 'Failed to load topics' };
});


describe('ContentListPage Component', () => {
  let defaultProps: ContentListPageProps;

  beforeEach(() => {
    (useTranslations as jest.Mock).mockImplementation((namespace) => {
      if (namespace === 'Common') return mockCommonT;
      return mockT;
    });
    (useLocale as jest.Mock).mockReturnValue(mockLocale());
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    defaultProps = {
      fetchTopicsFunction: mockFetchTopicsSuccess,
      translationNamespace: 'TestContent',
      detailPagePathPrefix: 'test-content',
      pageTitleKey: 'pageTitle',
      descriptionKey: 'pageDescription',
      readMorePromptKey: 'readMore',
      viewTopicKey: 'viewDetails',
      noTopicsFoundKey: 'noTopics',
    };
    mockT.mockClear();
    mockCommonT.mockClear();
    mockFetchTopicsSuccess.mockClear();
    mockFetchTopicsEmpty.mockClear();
    mockFetchTopicsError.mockClear();
  });

  it('renders loading state initially', () => {
    render(<ContentListPage {...defaultProps} />);
    expect(mockCommonT).toHaveBeenCalledWith('loading');
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders topics after successful fetch', async () => {
    render(<ContentListPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Topic 1 Title')).toBeInTheDocument();
      expect(screen.getByText('Topic 2 Title')).toBeInTheDocument();
    });
    expect(mockT).toHaveBeenCalledWith('pageTitle');
    expect(screen.getByText('pageTitle')).toBeInTheDocument();
    expect(screen.getAllByText('readMore')).toHaveLength(2);
    expect(screen.getAllByText('viewDetails →')).toHaveLength(2);
  });

  it('renders "no topics found" message when data is empty', async () => {
    render(<ContentListPage {...defaultProps} fetchTopicsFunction={mockFetchTopicsEmpty} />);
    await waitFor(() => {
      expect(screen.getByText('noTopics')).toBeInTheDocument();
    });
    expect(mockT).toHaveBeenCalledWith('noTopics');
  });

  it('renders error message when fetch fails', async () => {
    render(<ContentListPage {...defaultProps} fetchTopicsFunction={mockFetchTopicsError} />);
    await waitFor(() => {
      // The component itself calls t('errors.loadingTopics') or t('errors.generalError')
      // So we check if the mockT was called with the error key from the namespace
      expect(mockT).toHaveBeenCalledWith('errors.loadingTopics');
      // And that the error message (which is the key itself in this mock) is displayed
      expect(screen.getByText('errors.loadingTopics')).toBeInTheDocument();
    });
  });

  it('uses correct translation namespace and keys', async () => {
    render(<ContentListPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Topic 1 Title')).toBeInTheDocument();
    });
    expect(useTranslations).toHaveBeenCalledWith('TestContent');
    expect(useTranslations).toHaveBeenCalledWith('Common');
    expect(mockT).toHaveBeenCalledWith('pageTitle');
    expect(mockT).toHaveBeenCalledWith('pageDescription');
    expect(mockT).toHaveBeenCalledWith('readMore');
    expect(mockT).toHaveBeenCalledWith('viewDetails');
  });

  it('constructs correct links for topics', async () => {
    render(<ContentListPage {...defaultProps} />);
    await waitFor(() => {
      const link1 = screen.getByText('Topic 1 Title').closest('a');
      expect(link1).toHaveAttribute('href', '/en/test-content/topic1');
      const link2 = screen.getByText('Topic 2 Title').closest('a');
      expect(link2).toHaveAttribute('href', '/en/test-content/topic2');
    });
  });
});