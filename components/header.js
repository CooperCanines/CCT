document.addEventListener("DOMContentLoaded", () => {
    // Point fetch to the header.html file in /components/
    fetch('components/header.html')
        .then(response => {
            if (!response.ok) throw new Error("Header fetch failed");
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('header-placeholder');
            placeholder.innerHTML = data;

            // Re-evaluate embedded scripts inside header.html
            const scripts = placeholder.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        })
        .catch(error => console.error("Error loading header component:", error));
});
