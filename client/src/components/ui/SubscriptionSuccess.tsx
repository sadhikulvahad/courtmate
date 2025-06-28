const SubscriptionSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600">
          Subscription Successful!
        </h1>
        <p className="mt-4 text-gray-600">
          Your subscription has been activated. You can now enjoy all the
          features of your plan.
        </p>
        <a
          href="/advocate-settings"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Settings
        </a>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
