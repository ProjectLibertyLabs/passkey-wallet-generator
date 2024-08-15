.PHONY: create sign-pk sign-challenge

create:
	@echo "Creating passkey..."
	cd p256 && node index.js createPassKeys > passkey.txt
	@echo "Done."

sign-pk:
	@echo "Signing public key..."
	@if [ -z "$(PRIVATE_KEY)" ] || [ -z "$(ACCOUNT_PUBLIC_KEY)" ]; then \
		echo "Usage: make sign-pk PRIVATE_KEY=<privateKeyHex> ACCOUNT_PUBLIC_KEY=<accountPublicKeyHex>"; \
		exit 1; \
	fi
	cd p256 && node index.js signAccountPublicKey $(PRIVATE_KEY) $(ACCOUNT_PUBLIC_KEY) > signedPublicKey.txt
	@echo "Done."

sign-challenge:
	@echo "Signing challenge..."
	@if [ -z "$(PRIVATE_KEY)" ] || [ -z "$(PASSKEY_CHALLENGE)" ]; then \
		echo "Usage: make sign-challenge PRIVATE_KEY=<privateKeyHex> PASSKEY_CHALLENGE=<passkeyChallengeHex>"; \
		exit 1; \
	fi
	cd p256 && node index.js signPasskeyChallenge $(PRIVATE_KEY) $(PASSKEY_CHALLENGE) > signedChallenge.txt
	@echo "Done."
