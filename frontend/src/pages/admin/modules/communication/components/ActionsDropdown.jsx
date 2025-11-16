import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpOnSquareIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const ActionsDropdown = ({ 
  announcement, 
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
  deletingAnnouncementId,
  loading
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
        const dropdownHeight = 200; // Approximate dropdown height
        
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
        onClick: () => onViewDetails?.(announcement),
        className: 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
      },
      {
        label: announcement.status === 'posted' ? 'Hide' : 'Publish',
        icon: announcement.status === 'posted' ? EyeSlashIcon : ArrowUpOnSquareIcon,
        onClick: () => onToggleStatus?.(announcement.id),
        className: announcement.status === 'posted' 
          ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
          : 'text-gray-700 hover:bg-green-50 hover:text-green-700',
      },
      {
        label: 'Edit',
        icon: PencilIcon,
        onClick: () => onEdit?.(announcement),
        className: 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700',
      },
      {
        label: 'Delete',
        icon: TrashIcon,
        onClick: () => onDelete?.(announcement.id),
        className: 'text-gray-700 hover:bg-red-50 hover:text-red-700',
        disabled: deletingAnnouncementId === announcement.id || loading,
      },
    ];

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
                    {menuItems.map((item) => {
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
                              {item.label === 'Delete' && deletingAnnouncementId === announcement.id ? (
                                <>
                                  <div className="mr-3 h-5 w-5 flex-shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span className="flex-1 text-left">Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                      item.disabled
                                        ? 'text-gray-300'
                                        : 'text-gray-400 group-hover:text-current'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="flex-1 text-left">{item.label}</span>
                                </>
                              )}
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

