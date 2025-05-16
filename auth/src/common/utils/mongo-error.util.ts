export function getMongoDuplicateKeyMessage(keyValue: Record<string, any>) {
    if (keyValue?.email) return '이미 사용 중인 이메일입니다.';
    if (keyValue?.username) return '이미 사용 중인 사용자 이름입니다.';
    return '이미 사용 중인 값입니다.';
}
