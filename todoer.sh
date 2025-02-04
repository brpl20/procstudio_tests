#!/bin/bash

# File to store the temporary results
temp_file="TD_list_temp.md"

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

# Create a new file with updated content
awk '
BEGIN {todo_added=0}
/^## TODO List/ {if (todo_added) next; todo_added=1; system("cat " temp_file); next}
/^## Other Notes/ {if (!todo_added) {print "## TODO List\n"; system("cat " temp_file); print ""} todo_added=1}
{print}
END {if (!todo_added) {print "\n## TODO List"; system("cat " temp_file)}}
' temp_file="$temp_file" README.md > README_new.md

# Replace old README with new one
mv README_new.md README.md

# Remove the temporary file
rm "$temp_file"

echo "TD list has been updated in README.md"