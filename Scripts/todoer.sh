#!/bin/bash

# File to store the temporary results
temp_file="TD_list_temp.md"
structure_log="./logs/structure_$(date +%Y%m%d_%H%M%S).yaml"

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Function to generate YAML structure
generate_yaml_structure() {
    echo "timestamp: $(date '+%Y-%m-%d %H:%M:%S')" > "$structure_log"
    echo "structure:" >> "$structure_log"
    
    # Process each directory and file
    for dir in $(find . -type d -not -path "*/\.*" -not -path "*/node_modules*" -not -path "*/logs*"); do
        # Skip current directory
        if [ "$dir" = "." ]; then
            continue
        fi
        
        # Calculate the indent level based on path depth
        depth=$(($(echo "$dir" | tr -cd '/' | wc -c) - 1))
        indent=$(printf '%*s' $((depth * 2)) '')
        
        # Remove leading ./ from directory name
        dir_name=$(echo "$dir" | sed 's/^\.\///')
        echo "${indent}${dir_name}:" >> "$structure_log"
        
        # List files in the directory
        find "$dir" -maxdepth 1 -type f -not -name ".*" | while read -r file; do
            filename=$(basename "$file")
            echo "${indent}  - ${filename}" >> "$structure_log"
        done
    done
    
    # List files in root directory
    echo "root_files:" >> "$structure_log"
    find . -maxdepth 1 -type f -not -name ".*" -not -path "*/\.*" | while read -r file; do
        filename=$(basename "$file")
        echo "  - ${filename}" >> "$structure_log"
    done
}

# Function to remove existing TODO section
remove_todo_section() {
    sed -i.bak '/^## TODO List/,/^##/d' README.md
    # Remove backup file
    rm -f README.md.bak
}

# Clear the temporary file if it exists
> "$temp_file"

# Add a header to the temporary file
echo "## TODO List" >> "$temp_file"
echo "" >> "$temp_file"

# Search for TD comments and process them
grep -rn "// TD:" . --include=\*.{js,ts,jsx,tsx,java,py,rb,cpp,h} | while IFS=':' read -r file line content; do
    # Extract the TD message
    message=$(echo "$content" | sed 's/\/\/ TD: //')
    
    # Format and append to the temporary file
    echo "- [$file:$line] $message" >> "$temp_file"
done

# Check if README.md exists
if [ ! -f README.md ]; then
    echo "# ProcStudio Testing" > README.md
    echo "" >> README.md
    echo "Test Suit for ProcStudio in _staging using playwright." >> README.md
    echo "" >> README.md
fi

# Remove existing TODO section and add the new one
remove_todo_section
cat "$temp_file" >> README.md

# Generate YAML structure log
generate_yaml_structure

# Remove the temporary file
rm "$temp_file"

echo "TD list has been updated in README.md"
echo "File structure has been logged to $structure_log"