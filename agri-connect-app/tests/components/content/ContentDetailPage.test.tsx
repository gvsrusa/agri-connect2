import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentDetailPage, { ContentDetailPageProps } from '@/components/content/ContentDetailPage';
import { ContentItem } from '@/lib/contentActions';
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

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} />;
    },
  }));

const mockT = jest.fn((key) => key);
const mockCommonT = jest.fn((key) => key);
const mockCategoriesT = jest.fn((key) => `cat_${key}`);
const mockLocale = jest.fn(() => 'en');
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();

const mockContentItem: ContentItem = {
  id: '1',
  topic_key: 'test-topic',
  language_code: 'en',
  title: 'Test Topic Title',
  body_text: 'This is the first paragraph.\n\nThis is the second paragraph.',
  category_key: 'test-category',
  image_url: 'http://example.com/image.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockFetchContentSuccess = jest.fn(async (topicKey: string, locale: string): Promise<{ data: ContentItem | null; error: string | null }> => {
  return { data: mockContentItem, error: null };
});

const mockFetchContentNotFound = jest.fn(async (topicKey: string, locale: string): Promise<{ data: ContentItem | null; error: string | null }> => {
  return { data: null, error: null }; // Simulates data not found but no server error
});

const mockFetchContentError = jest.fn(async (topicKey: string, locale: string): Promise<{ data: ContentItem | null; error: string | null }> => {
  return { data: null, error: 'Failed to load content' };
});

describe('ContentDetailPage Component', () => {
  let defaultProps: ContentDetailPageProps;

  beforeEach(() => {
    (useTranslations as jest.Mock).mockImplementation((namespace) => {
      if (namespace === 'Common') return mockCommonT;
      if (namespace === 'categories') return mockCategoriesT;
      return mockT;
    });
    (useLocale as jest.Mock).mockReturnValue(mockLocale());
    (useRouter as jest.Mock).mockReturnValue({ back: mockRouterBack, push: mockRouterPush });

    defaultProps = {
      topicKey: 'test-topic',
      fetchContentFunction: mockFetchContentSuccess,
      translationNamespace: 'TestContentDetail',
      backButtonTextKey: 'backButton',
      backLinkPath: '/test-content',
      viewAllTopicsKey: 'viewAll',
      categoryBadgeClassName: 'custom-badge-class',
    };
    mockT.mockClear();
    mockCommonT.mockClear();
    mockCategoriesT.mockClear();
    mockRouterBack.mockClear();
    mockFetchContentSuccess.mockClear();
    mockFetchContentNotFound.mockClear();
    mockFetchContentError.mockClear();
  });

  it('renders loading state initially', () => {
    render(<ContentDetailPage {...defaultProps} />);
    expect(mockCommonT).toHaveBeenCalledWith('loading');
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders content after successful fetch', async () => {
    render(<ContentDetailPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Test Topic Title')).toBeInTheDocument();
      expect(screen.getByText('This is the first paragraph.')).toBeInTheDocument();
      expect(screen.getByText('This is the second paragraph.')).toBeInTheDocument();
      expect(screen.getByAltText('Test Topic Title')).toHaveAttribute('src', 'http://example.com/image.jpg');
      expect(screen.getByText('cat_test-category')).toBeInTheDocument();
      expect(screen.getByText('cat_test-category')).toHaveClass('custom-badge-class');
    });
  });

  it('renders "content not found" message when data is null and no error', async () => {
    render(<ContentDetailPage {...defaultProps} fetchContentFunction={mockFetchContentNotFound} />);
    await waitFor(() => {
      expect(mockT).toHaveBeenCalledWith('errors.contentNotFound');
      expect(screen.getByText('errors.contentNotFound')).toBeInTheDocument();
    });
  });
  
  it('renders error message when fetch fails', async () => {
    render(<ContentDetailPage {...defaultProps} fetchContentFunction={mockFetchContentError} />);
    await waitFor(() => {
      expect(mockT).toHaveBeenCalledWith('errors.loadingContent');
      expect(screen.getByText('errors.loadingContent')).toBeInTheDocument();
    });
  });

  it('calls router.back when back button is clicked', async () => {
    render(<ContentDetailPage {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('backButton')).toBeInTheDocument());
    fireEvent.click(screen.getByText('backButton'));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('uses correct translation namespace and keys', async () => {
    render(<ContentDetailPage {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Test Topic Title')).toBeInTheDocument());
    expect(useTranslations).toHaveBeenCalledWith('TestContentDetail');
    expect(useTranslations).toHaveBeenCalledWith('Common');
    expect(useTranslations).toHaveBeenCalledWith('categories');
    expect(mockT).toHaveBeenCalledWith('backButton');
    expect(mockT).toHaveBeenCalledWith('viewAll');
    expect(mockCategoriesT).toHaveBeenCalledWith('test-category');
  });

  it('constructs correct "view all topics" link', async () => {
    render(<ContentDetailPage {...defaultProps} />);
    await waitFor(() => {
      const link = screen.getByText('viewAll →');
      expect(link).toHaveAttribute('href', '/en/test-content');
    });
  });

  it('does not render image if image_url is not provided', async () => {
    const contentWithoutImage = { ...mockContentItem, image_url: undefined };
    const fetchFn = jest.fn().mockResolvedValue({ data: contentWithoutImage, error: null });
    render(<ContentDetailPage {...defaultProps} fetchContentFunction={fetchFn} />);
    await waitFor(() => {
      expect(screen.getByText('Test Topic Title')).toBeInTheDocument();
      expect(screen.queryByAltText('Test Topic Title')).not.toBeInTheDocument();
    });
  });

  it('does not render category if category_key is not provided', async () => {
    const contentWithoutCategory = { ...mockContentItem, category_key: undefined };
    const fetchFn = jest.fn().mockResolvedValue({ data: contentWithoutCategory, error: null });
    render(<ContentDetailPage {...defaultProps} fetchContentFunction={fetchFn} />);
    await waitFor(() => {
      expect(screen.getByText('Test Topic Title')).toBeInTheDocument();
      expect(mockCategoriesT).not.toHaveBeenCalled();
      // Check that no element with the badge class exists
      expect(screen.queryByText((content, element) => element?.classList.contains('custom-badge-class') ?? false)).not.toBeInTheDocument();
    });
  });
});