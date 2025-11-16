import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

const ActionsDropdown = ({ 
  record, 
  activeTab, 
  onViewDetails, 
  onEditRecord,
  onApprove,
  onDeny,
  onConfirmPayment,
  onMarkAsFree,
  onGeneratePdf, 
  onViewPdf, 
  onDownloadPdf, 
  onGenerateReceipt,
  onDownloadReceipt,
  confirmingPayment,
  markingAsFree,
  generatingPdf 
}) => {
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [shouldFlipUp, setShouldFlipUp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320; // Approximate dropdown height
        
        // Check if dropdown would overflow bottom of viewport
        const wouldOverflow = buttonRect.bottom + dropdownHeight > viewportHeight;
        setShouldFlipUp(wouldOverflow);

        // Calculate position
        setDropdownPosition({
          top: wouldOverflow ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
          left: buttonRect.right - 224, // 224px = w-56 (14rem)
        });
      };

      updatePosition();

      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const DropdownContent = ({ children }) => {
    if (!isOpen) return null;

    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999,
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  const getMenuItems = () => {
    const items = [
      {
        label: 'View Details',
        icon: EyeIcon,
        onClick: () => onViewDetails?.(record),
        className: 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
      },
    ];

    // Debug logging for PDF actions (remove in production)
    if (activeTab === 'records') {
      console.log('ActionsDropdown - Record in Document Records tab:', {
        id: record.id,
        status: record.status,
        paymentStatus: record.paymentStatus,
        pdfPath: record.pdfPath,
        pdf_path: record.pdf_path,
        hasPdfPath: record.pdfPath || record.pdf_path
      });
    }

    // Show Approve and Deny actions ONLY for pending requests (not processing!)
    if (activeTab === 'requests' && record.status === 'Pending') {
      items.push({
        label: 'Approve Request',
        icon: CheckCircleIcon,
        onClick: () => onApprove?.(record),
        className: 'text-gray-700 hover:bg-green-50 hover:text-green-700',
      });
      items.push({
        label: 'Deny Request',
        icon: XCircleIcon,
        onClick: () => onDeny?.(record),
        className: 'text-gray-700 hover:bg-red-50 hover:text-red-700',
      });
    }

    // Only show Edit for requests tab
    if (activeTab === 'requests') {
      items.push({
        label: 'Edit Record',
        icon: PencilSquareIcon,
        onClick: () => onEditRecord?.(record),
        className: 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700',
      });
    }

    // Show payment confirmation only for processing unpaid requests
    // Payment can only be confirmed after PDF is generated (status becomes Processing)
    if (activeTab === 'requests' && record.status === 'Processing' && record.paymentStatus === 'unpaid') {
      if (record.paymentAmount && record.paymentAmount > 0) {
        // Paid documents - show Confirm Payment
        items.push({
          label: `Confirm Payment (₱${parseFloat(record.paymentAmount).toFixed(2)})`,
          icon: CurrencyDollarIcon,
          onClick: () => onConfirmPayment?.(record),
          className: 'text-gray-700 hover:bg-green-50 hover:text-green-700',
          disabled: confirmingPayment === record.id,
        });
      } else if (!record.paymentAmount || record.paymentAmount === 0) {
        // Free documents - show Mark as Free
        items.push({
          label: 'Mark as Free',
          icon: GiftIcon,
          onClick: () => onMarkAsFree?.(record),
          className: 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
          disabled: markingAsFree === record.id,
        });
      }
    }

    // Show PDF actions for approved or processing records
    // PDF actions should be available in BOTH Requests AND Records tabs
    // Check status case-insensitively to handle any variations
    const recordStatus = (record.status || '').toLowerCase();
    const hasPdfPath = !!(record.pdfPath || record.pdf_path); // Check both camelCase and snake_case
    
    // Debug logging for PDF path detection
    if (activeTab === 'records' && (recordStatus === 'approved' || recordStatus === 'processing')) {
      console.log('PDF Actions Check - Document Records tab:', {
        recordId: record.id,
        status: record.status,
        recordStatus,
        pdfPath: record.pdfPath,
        pdf_path: record.pdf_path,
        hasPdfPath,
        willShowPDFActions: recordStatus === 'approved' || recordStatus === 'processing'
      });
    }
    
    // Show PDF actions for approved or processing records in BOTH tabs
    if (recordStatus === 'approved' || recordStatus === 'processing') {
      if (!hasPdfPath) {
        // Show Generate PDF if PDF doesn't exist
        // This should work in both Requests and Records tabs
        items.push({
          label: 'Generate PDF',
          icon: DocumentTextIcon,
          onClick: () => onGeneratePdf?.(record),
          className: 'text-gray-700 hover:bg-green-50 hover:text-green-700',
          disabled: generatingPdf === record.id,
        });
      } else {
        // Show View/Download PDF when PDF exists
        // These actions should be available in BOTH Requests AND Records tabs
        items.push({
          label: 'View PDF',
          icon: EyeIcon,
          onClick: () => {
            console.log('View PDF clicked - Document Records tab:', {
              recordId: record.id,
              pdfPath: record.pdfPath || record.pdf_path
            });
            onViewPdf?.(record);
          },
          className: 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
        });
        items.push({
          label: 'Download PDF',
          icon: ArrowDownTrayIcon,
          onClick: () => {
            console.log('Download PDF clicked - Document Records tab:', {
              recordId: record.id,
              pdfPath: record.pdfPath || record.pdf_path
            });
            onDownloadPdf?.(record);
          },
          className: 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700',
        });
      }
    }

    // Show download receipt for paid documents with receipts (copied from InventoryAssets.jsx pattern)
    if (record.paymentStatus && record.paymentStatus.toLowerCase() === 'paid' && 
        record.paidDocument?.receipt_number) {
      items.push({
        label: `Download Receipt (${record.paidDocument.receipt_number})`,
        icon: ArrowDownTrayIcon,
        onClick: () => onDownloadReceipt?.(record),
        className: 'text-gray-700 hover:bg-green-50 hover:text-green-700',
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        // Update isOpen state when menu opens/closes
        useEffect(() => {
          setIsOpen(open);
        }, [open]);

        return (
          <>
            <Menu.Button
              ref={buttonRef}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="More actions"
            >
              <ChevronDownIcon className="w-5 h-5" />
            </Menu.Button>

            <DropdownContent>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className={`w-56 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden ${
                    shouldFlipUp ? 'origin-bottom-right' : 'origin-top-right'
                  }`}
                  static
                >
                  <div className="py-1">
                    {menuItems.map((item, index) => {
                      return (
                        <Menu.Item key={item.label} disabled={item.disabled}>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!item.disabled) {
                                  item.onClick();
                                }
                              }}
                              disabled={item.disabled}
                              className={`${
                                item.className
                              } group flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                                active ? 'translate-x-1' : ''
                              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <item.icon
                                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                  item.disabled
                                    ? 'text-gray-300'
                                    : 'text-gray-400 group-hover:text-current'
                                }`}
                                aria-hidden="true"
                              />
                              <span className="flex-1 text-left">{item.label}</span>
                            </button>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </div>
                </Menu.Items>
              </Transition>
            </DropdownContent>
          </>
        );
      }}
    </Menu>
  );
};

export default ActionsDropdown;
