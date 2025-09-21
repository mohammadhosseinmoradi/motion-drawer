# Motion Drawer

A headless drawer with smooth animations, easily integrable with any headless library.

## Usage

To start using the library, install it in your project:

```bash
pnpm add motion-drawer
```

Simple usage:

```jsx
import { Drawer, DrawerHeader, DrawerBody, DrawerActions } from "motion-drawer";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerHeader>Header</DrawerHeader>
      <DrawerBody>Main content goes here (scroll area)</DrawerBody>
      <DrawerActions>Actions</DrawerActions>
    </Drawer>
  );
}
```

Advance usage with integrate it with `@headlessui/react` library:

```jsx
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Drawer, DrawerActions, DrawerBody, DrawerHeader } from "motion-drawer";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      {/* The Drawer is superpowered with the Motion library and can be used inside AnimatePresence */}
      <AnimatePresence>
        {open && (
          <Dialog open={open} onClose={setOpen} className="fixed z-50">
            <DialogPanel
              // Render DialogPanel as Drawer
              as={Drawer}
              className="z-2 w-[calc(100%-2rem)] max-w-96 rounded-xl bg-neutral-800 text-white"
              snapPoints={["200px", "auto"]}
              defaultOpen={open}
              onOpenChange={setOpen}
              offset={16}
              padding={16}
              borderRadius={null}
              minSize={200}
            >
              <DrawerHeader className="flex items-center justify-center border-b bg-neutral-800 p-4">
                Header
              </DrawerHeader>
              <DrawerBody>
                {[...Array(10)].map((_, index) => {
                  return <p key={index}>This is a paragraph.</p>;
                })}
              </DrawerBody>
              <DrawerActions className="flex items-center justify-center border-t bg-neutral-800 p-4 pb-6">
                Actions
              </DrawerActions>
            </DialogPanel>
            {/* Backdrop */}
            <DialogBackdrop
              as={motion.div}
              className="fixed inset-0 z-1 bg-black/25 backdrop-blur-xs"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  opacity: 1
                },
                closed: {
                  opacity: 0
                }
              }}
            />
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Documentation

Find the full API reference and examples in the [documentation]().
