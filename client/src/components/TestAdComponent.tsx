import React from "react";
import AdComponent from "./AdComponent";

// This is a test component to verify ad integration
// You can use this in development to test ad placement
export const TestAdComponent: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Ad Integration Test</h2>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Test Ad Placement (Auto Format)
        </h3>
        <AdComponent
          slot="1234567890" // Replace with your actual ad slot
          format="auto"
          responsive={true}
        />
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Test Ad Placement (Rectangle)
        </h3>
        <AdComponent
          slot="1234567890" // Replace with your actual ad slot
          format="rectangle"
          responsive={false}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> In development mode, ads will show with
          "data-adtest=on" for testing purposes.
        </p>
        <p>Make sure to:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>Replace slot IDs with your actual AdSense ad unit slots</li>
          <li>Ensure your domain is authorized in AdSense</li>
          <li>Test on production to see real ads</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAdComponent;
