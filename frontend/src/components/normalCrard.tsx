import { ReactNode, forwardRef } from "react";

interface CardComponentProps {
  children?: ReactNode;
  title?: string;
}

// Use forwardRef to pass the ref to the root div
const NormalCard = forwardRef<HTMLDivElement, CardComponentProps>(
  ({ children, title }, ref) => {
    return (
      <div ref={ref}>
        {title && (
          <h1 className="text-2xl text-black dark:text-white mt-4 mb-1">
            {title}
          </h1>
        )}
        <div className="bg-[#e9e7d8] dark:bg-[#171c24] border text-white p-2 mt-1 rounded-lg inline-block shadow-md">
          {/* Children */}
          {children}
        </div>
      </div>
    );
  }
);

export default NormalCard;
