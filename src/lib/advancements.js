// Function to remove all elements with the specified class
export const destroyAdvancementManagers = () => {
    // Select all elements with the class 'application dnd5e2 advancement manager'
    const elements = document.querySelectorAll('.application.dnd5e2.advancement.manager');
    console.log('advancement managers', elements);
    // Iterate over the NodeList and remove each element
    elements.forEach(element => {
        element.remove(); // Remove the element from the DOM
    });
}

// Example usage
// destroyAdvancementManagers();
