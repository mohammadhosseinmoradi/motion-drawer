# Motion Drawer

A headless drawer with smooth animations, easily integrable with any headless library.

## Usage

To start using the library, install it in your project:

```bash
pnpm add motion-drawer
```

Simple usage:

```jsx
import { Drawer } from "motion-drawer";

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
import { AnimatePresence } from "motion/react";
import { Drawer } from "motion-drawer";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      {/* The Drawer is superpowered with the Motion library and can be used inside AnimatePresence */}
      <AnimatePresence>
        {open && (
          <Dialog open={open} onClose={setOpen}>
            <DialogPanel
              // Render DialogPanel as Drawer
              as={Drawer}
              className="w-[calc(100%-2rem)] max-w-96 rounded-xl bg-neutral-800 text-white select-none"
              snapPoints={["200px", "auto"]}
              defaultOpen={open}
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
            <motion.div
              className="pointer-events-none fixed inset-0 bg-black/25 backdrop-blur-xs"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  opacity: 1,
                },
                closed: {
                  opacity: 0,
                },
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
