import os
import zipfile

def create_project_zip():
    base_dir = os.path.abspath(os.path.dirname(__file__) + '/..')
    output_zip = os.path.join(base_dir, 'public', 'chrisella-kurniawan-ai-mentor.zip')
    
    # Ensure public dir exists
    os.makedirs(os.path.dirname(output_zip), exist_ok=True)
    
    # Remove existing zip if present
    if os.path.exists(output_zip):
        os.remove(output_zip)
        
    ignored_dirs = {'node_modules', '.git', 'dist', '__pycache__', '.aistudio'}
    ignored_extensions = {'.zip', '.log'}
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
            
            for file in files:
                if any(file.endswith(ext) for ext in ignored_extensions):
                    continue
                if file.startswith('.DS_Store'):
                    continue
                    
                file_path = os.path.join(root, file)
                # Compute relative path inside zip
                rel_path = os.path.relpath(file_path, base_dir)
                
                # Exclude scripts/create_zip.py or unnecessary files
                if rel_path.startswith('scripts/'):
                    continue
                    
                zipf.write(file_path, arcname=rel_path)
                
    print(f"Zip created successfully at: {output_zip}")
    print(f"File size: {os.path.getsize(output_zip) / 1024:.2f} KB")

if __name__ == '__main__':
    create_project_zip()
