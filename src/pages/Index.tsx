
import SimpleHeader from '@/components/SimpleHeader';
import RSSFeedList from '@/components/RSSFeedList';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />
      <main className="max-w-4xl mx-auto p-6">
        <RSSFeedList />
      </main>
    </div>
  );
};

export default Index;
