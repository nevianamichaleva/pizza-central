import PageViewTracker from '../components/PageViewTracker';

export default function Template({ children }) {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  );
}
