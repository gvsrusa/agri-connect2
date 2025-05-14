import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/locales/en.json'; // Default to English

// Mock the feedback service
// import { submitFeedback } from '@/services/feedbackService';
// jest.mock('@/services/feedbackService', () => ({
//   submitFeedback: jest.fn().mockResolvedValue({ success: true }),
// }));

// Placeholder for the actual FeedbackPage component
const FeedbackPage = () => {
  // const [feedback, setFeedback] = React.useState('');
  // const handleSubmit = async () => {
  //   await submitFeedback(feedback);
  //   // handle success/error
  // };
  return (
    <div>
      <h2>Provide Feedback</h2>
      <textarea placeholder="Your feedback" />
      <button>Submit Feedback</button>
    </div>
  );
};

describe('FeedbackPage', () => {
  const renderFeedbackPage = () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <FeedbackPage />
      </NextIntlClientProvider>
    );
  };

  it('should render the feedback page content with a form', () => {
    renderFeedbackPage();
    expect(screen.getByText('Provide Feedback')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your feedback')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument();
  });

  it.todo('should allow users to type feedback into the textarea');
  it.todo('should successfully submit feedback when the submit button is clicked');
  it.todo('should display a success message after successful submission');
  it.todo('should display an error message if submission fails');
});