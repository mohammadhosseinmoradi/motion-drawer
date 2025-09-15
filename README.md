# Motion Drawer

Motion Drawer. A lightweight, headless React component for creating animated bottom sheets and drawers with smooth
motion and full customization. Can be integrated with any headless UI library.

## Usage

To start using the library, install it in your project:,

```bash
pnpm add motion-drawer
```

Simple usage:

```jsx
import {Drawer} from 'motion-drawer';

function MyComponent() {
    const [open, setOpen] = useState(false);

    return (<Drawer open={open} onClose={() => setOpen(false)}>
        <DrawerHeader>
            Header
        </DrawerHeader>
        <DrawerBody>
            Main content goes here (scroll area)
        </DrawerBody>
        <DrawerActions>
            Actions
        </DrawerActions>
    </Drawer>);
}
```

Advance usage with integrate it with `@headlessui/react` library:

```jsx
import { AnimatePresence } from 'motion/react';
import { Drawer } from 'motion-drawer';

function MyComponent() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(true)}>Open drawer</button>
            {/* The Drawer is superpowered with the Motion library and can be used inside AnimatePresence */}
            <AnimatePresence>
                {open && (
                    <Dialog open={open} onClose={setOpen}>
                        <DialogPanel
                            {/* Render DialogPanel as Drawer */}
                            as={Drawer}
                            className="bg-neutral-800 text-white w-[calc(100%-2rem)] max-w-96 rounded-xl select-none"
                            snapPoints={["200px", "auto"]}
                            open={open}
                            onOpenChange={setOpen}
                            offset={16}
                            padding={16}
                            borderRadius={null}
                            minSize={200}
                        >
                            <DrawerHeader className="bg-neutral-800 flex items-center justify-center border-b p-4">
                                Header
                            </DrawerHeader>
                            <DrawerBody>
                                {[...Array(10)].map((_, index) => {
                                    return (
                                        <p key={index}>This is a paragraph.</p>
                                    );
                                })}
                            </DrawerBody>
                            <DrawerActions
                                className="bg-neutral-800 flex items-center justify-center border-t p-4 pb-6">
                                Actions
                            </DrawerActions>
                        </DialogPanel>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 pointer-events-none backdrop-blur-xs bg-black/25"
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
