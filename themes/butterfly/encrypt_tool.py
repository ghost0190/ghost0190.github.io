import base64

def encrypt_text():
    print("=== Hexo 加密工具 v3.0 (带密码校验功能) ===")
    password = input("请设置密码: ")
    print("请输入要加密的内容 (输入 END 结束):")
    
    lines = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line == 'END':
            break
        lines.append(line)
    
    content_str = "\n".join(lines)
    
    # [关键改进] 添加一个固定的校验头（Magic Prefix）
    # 只有解密出这个头，才说明密码是正确的
    magic_prefix = "::HEXO_LOCK_CHECK::"
    full_content = magic_prefix + content_str
    
    # 转为 UTF-8 字节
    content_bytes = full_content.encode('utf-8')
    pass_bytes = password.encode('utf-8')
    
    # XOR 加密
    encrypted_bytes = bytearray()
    pass_len = len(pass_bytes)
    for i, byte_val in enumerate(content_bytes):
        key_byte = pass_bytes[i % pass_len]
        encrypted_bytes.append(byte_val ^ key_byte)
    
    # Base64 编码
    b64_result = base64.b64encode(encrypted_bytes).decode('utf-8')
    
    print("\n=== 加密结果 (请复制以下 HTML，粘贴时切记不要缩进) ===\n")
    
    html_template = f"""
<div class="h-lock-container" style="text-align:center; padding: 30px; background: var(--card-color, #f5f5f5); border-radius: 12px; border: 1px solid var(--border-color, #eee);">
    <div id="h-lock-icon" style="font-size: 40px; margin-bottom: 10px;">🔒</div>
    <div id="h-lock-msg" style="margin-bottom: 15px; font-weight: bold;">私密内容，请验证权限</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
        <input type="password" id="h-pass" placeholder="输入密码" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; outline: none;">
        <button onclick="hDecrypt()" style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer;">解锁</button>
    </div>
    
    <div id="h-error" style="color: #ff4d4f; display: none; margin-top: 10px; font-size: 14px;"></div>
</div>

<div id="h-content" style="display:none; margin-top:20px;"></div>
<div id="h-data" style="display:none;">{b64_result}</div>

<script>
async function hDecrypt() {{
    const passInput = document.getElementById('h-pass').value;
    const encryptedData = document.getElementById('h-data').innerText;
    const contentDiv = document.getElementById('h-content');
    const errorMsg = document.getElementById('h-error');
    const container = document.querySelector('.h-lock-container');
    const magicPrefix = "::HEXO_LOCK_CHECK::";

    if (!passInput) return;

    try {{
        const binaryString = atob(encryptedData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {{
            bytes[i] = binaryString.charCodeAt(i);
        }}

        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(passInput);
        
        const decryptedBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {{
            decryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        }}

        const decoder = new TextDecoder('utf-8', {{fatal: true}}); // fatal:true 会在乱码时抛出错误
        const decodedString = decoder.decode(decryptedBytes);

        // [核心校验逻辑] 检查是否包含暗号
        if (!decodedString.startsWith(magicPrefix)) {{
            throw new Error("密码错误");
        }}

        // 移除暗号，只显示正文
        const realContent = decodedString.substring(magicPrefix.length);
        
        contentDiv.innerHTML = realContent.replace(/\\n/g, '<br>');
        
        container.style.display = 'none';
        contentDiv.style.display = 'block';
        errorMsg.style.display = 'none';

    }} catch (e) {{
        console.error("解密失败:", e);
        errorMsg.style.display = 'block';
        // 如果是 TextDecoder 抛出的错，说明乱码太严重；如果是我们抛出的，说明密码不对
        errorMsg.innerText = "密码错误，请重试";
        
        // 简单动画提示（抖动效果可选，这里仅显示文字）
        const input = document.getElementById('h-pass');
        input.value = '';
        input.focus();
    }}
}}
</script>
"""
    print(html_template)

if __name__ == "__main__":
    encrypt_text()